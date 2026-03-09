import { randomUUID } from "node:crypto";

import { Prisma, type StockMovementType } from "@prisma/client";

import {
  ErrorCodes,
  type OrderListQuery,
  type PlaceOrderDto,
  type UpdateOrderStatusDto,
} from "@/shared/contracts";
import { buildCheckoutQuote } from "@/server/checkout";
import { prisma } from "@/server/db";
import { isValidStatusTransition } from "@/server/domain";
import { AppError } from "@/server/http";

type DbClient = Prisma.TransactionClient | typeof prisma;

const orderListInclude = {
  items: {
    orderBy: {
      id: "asc",
    },
  },
  payments: {
    orderBy: {
      createdAt: "desc",
    },
  },
} satisfies Prisma.OrderInclude;

const orderDetailInclude = {
  items: {
    orderBy: {
      id: "asc",
    },
  },
  payments: {
    orderBy: {
      createdAt: "desc",
    },
    include: {
      proofs: {
        orderBy: {
          uploadedAt: "desc",
        },
      },
    },
  },
  promotions: {
    include: {
      promotion: {
        select: {
          id: true,
          code: true,
          type: true,
          value: true,
        },
      },
    },
  },
  reservations: {
    orderBy: {
      createdAt: "asc",
    },
  },
} satisfies Prisma.OrderInclude;

type OrderListRecord = Prisma.OrderGetPayload<{
  include: typeof orderListInclude;
}>;

type OrderDetailRecord = Prisma.OrderGetPayload<{
  include: typeof orderDetailInclude;
}>;

function isJsonObject(value: Prisma.JsonValue): value is Record<string, Prisma.JsonValue> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeCustomerSnapshot(snapshot: Prisma.JsonValue) {
  if (!isJsonObject(snapshot)) {
    return {
      name: "Unknown Customer",
      email: "",
      phone: null,
    };
  }

  return {
    name: typeof snapshot.name === "string" ? snapshot.name : "Unknown Customer",
    email: typeof snapshot.email === "string" ? snapshot.email : "",
    phone: typeof snapshot.phone === "string" ? snapshot.phone : null,
  };
}

function normalizeAddressSnapshot(snapshot: Prisma.JsonValue) {
  if (!isJsonObject(snapshot)) {
    return {
      recipientName: "",
      phone: "",
      addressLine1: "",
      addressLine2: null,
      district: null,
      city: null,
      postalCode: null,
      notes: null,
    };
  }

  return {
    recipientName:
      typeof snapshot.recipientName === "string" ? snapshot.recipientName : "",
    phone: typeof snapshot.phone === "string" ? snapshot.phone : "",
    addressLine1:
      typeof snapshot.addressLine1 === "string" ? snapshot.addressLine1 : "",
    addressLine2:
      typeof snapshot.addressLine2 === "string" ? snapshot.addressLine2 : null,
    district: typeof snapshot.district === "string" ? snapshot.district : null,
    city: typeof snapshot.city === "string" ? snapshot.city : null,
    postalCode:
      typeof snapshot.postalCode === "string" ? snapshot.postalCode : null,
    notes: typeof snapshot.notes === "string" ? snapshot.notes : null,
  };
}

function serializeOrder<T extends OrderListRecord | OrderDetailRecord>(order: T) {
  const latestPayment = order.payments[0] ?? null;

  return {
    ...order,
    customerSnapshot: normalizeCustomerSnapshot(order.customerSnapshot),
    addressSnapshot: normalizeAddressSnapshot(order.addressSnapshot),
    itemCount: order.items.reduce((sum, item) => sum + item.qty, 0),
    latestPayment,
  };
}

function buildOrderWhere(query: OrderListQuery) {
  const where: Prisma.OrderWhereInput = {};

  if (query.status) {
    where.status = query.status;
  }

  if (query.search) {
    where.orderNumber = {
      contains: query.search,
      mode: "insensitive",
    };
  }

  return where;
}

function createOrderNumber() {
  const timestamp = new Date()
    .toISOString()
    .replace(/[-:TZ.]/g, "")
    .slice(0, 14);

  return `ORD-${timestamp}-${randomUUID().slice(0, 6).toUpperCase()}`;
}

async function resolveShippingAddress(
  db: DbClient,
  userId: string,
  dto: PlaceOrderDto,
) {
  if (dto.shippingAddress) {
    return {
      recipientName: dto.shippingAddress.recipientName,
      phone: dto.shippingAddress.phone,
      addressLine1: dto.shippingAddress.addressLine1,
      addressLine2: dto.shippingAddress.addressLine2 ?? null,
      district: dto.shippingAddress.district ?? null,
      city: dto.shippingAddress.city ?? null,
      postalCode: dto.shippingAddress.postalCode ?? null,
      notes: dto.shippingAddress.notes ?? null,
      addressId: null as string | null,
    };
  }

  if (!dto.shippingAddressId) {
    throw new AppError(
      400,
      ErrorCodes.VALIDATION_ERROR,
      "Shipping address is required until saved address flow is fully migrated",
    );
  }

  const address = await db.address.findFirst({
    where: {
      id: dto.shippingAddressId,
      userId,
    },
  });

  if (!address) {
    throw new AppError(404, ErrorCodes.NOT_FOUND, "Address not found");
  }

  return {
    recipientName: address.recipientName,
    phone: address.phone,
    addressLine1: address.addressLine1,
    addressLine2: address.addressLine2,
    district: address.district,
    city: address.city,
    postalCode: address.postalCode,
    notes: address.notes,
    addressId: address.id,
  };
}

async function getUserCustomerSnapshot(db: DbClient, userId: string) {
  const user = await db.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
    },
  });

  if (!user) {
    throw new AppError(404, ErrorCodes.NOT_FOUND, "User not found");
  }

  return {
    name: user.name,
    email: user.email,
    phone: user.phone ?? null,
  };
}

async function createStockMovement(
  db: DbClient,
  input: {
    orderId: string;
    actorId?: string | null;
    type: StockMovementType;
    qty: number;
    productVariantId: string;
    reason: string;
  },
) {
  await db.stockMovement.create({
    data: {
      productVariantId: input.productVariantId,
      type: input.type,
      qty: input.qty,
      reason: input.reason,
      referenceId: input.orderId,
      actorId: input.actorId ?? null,
    },
  });
}

async function updateReservationsForCancellation(
  db: DbClient,
  orderId: string,
  actorId?: string | null,
) {
  const reservations = await db.stockReservation.findMany({
    where: {
      orderId,
      status: {
        in: ["ACTIVE", "CONSUMED"],
      },
    },
  });

  for (const reservation of reservations) {
    if (reservation.status === "CONSUMED") {
      await db.productVariant.update({
        where: {
          id: reservation.productVariantId,
        },
        data: {
          stockOnHand: {
            increment: reservation.qty,
          },
        },
      });
    }

    await db.stockReservation.update({
      where: {
        id: reservation.id,
      },
      data: {
        status: "RELEASED",
      },
    });
    await createStockMovement(db, {
      orderId,
      actorId,
      type: "ORDER_CANCEL_RELEASE",
      qty: reservation.qty,
      productVariantId: reservation.productVariantId,
      reason: "Order cancelled; stock released back to available pool",
    });
  }
}

async function consumeReservationsForPayment(
  db: DbClient,
  orderId: string,
  actorId?: string | null,
) {
  const reservations = await db.stockReservation.findMany({
    where: {
      orderId,
      status: "ACTIVE",
    },
  });

  for (const reservation of reservations) {
    await db.productVariant.update({
      where: {
        id: reservation.productVariantId,
      },
      data: {
        stockOnHand: {
          decrement: reservation.qty,
        },
      },
    });
    await db.stockReservation.update({
      where: {
        id: reservation.id,
      },
      data: {
        status: "CONSUMED",
      },
    });
    await createStockMovement(db, {
      orderId,
      actorId,
      type: "ORDER_CONSUME",
      qty: -reservation.qty,
      productVariantId: reservation.productVariantId,
      reason: "Order marked paid; stock consumed from on-hand inventory",
    });
  }
}

async function syncPaymentStatusForOrder(
  db: DbClient,
  orderId: string,
  nextStatus: UpdateOrderStatusDto["status"],
) {
  const payment = await db.payment.findFirst({
    where: {
      orderId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!payment) {
    return;
  }

  if (nextStatus === "PAYMENT_REVIEW") {
    await db.payment.update({
      where: {
        id: payment.id,
      },
      data: {
        status: "UNDER_REVIEW",
        submittedAt: payment.submittedAt ?? new Date(),
      },
    });

    return;
  }

  if (nextStatus === "PENDING_PAYMENT") {
    await db.payment.update({
      where: {
        id: payment.id,
      },
      data: {
        status: "REJECTED",
      },
    });

    return;
  }

  if (nextStatus === "PAID") {
    await db.payment.update({
      where: {
        id: payment.id,
      },
      data: {
        status: "CONFIRMED",
        confirmedAt: payment.confirmedAt ?? new Date(),
      },
    });

    return;
  }

  if (nextStatus === "CANCELLED" && payment.status !== "CONFIRMED") {
    await db.payment.update({
      where: {
        id: payment.id,
      },
      data: {
        status: "REJECTED",
      },
    });
  }
}

export async function placeOrder(
  userId: string,
  dto: PlaceOrderDto,
  idempotencyKey?: string,
) {
  if (idempotencyKey) {
    const existingOrder = await prisma.order.findUnique({
      where: {
        idempotencyKey,
      },
      include: orderDetailInclude,
    });

    if (existingOrder) {
      if (existingOrder.userId !== userId) {
        throw new AppError(
          409,
          ErrorCodes.CHECKOUT_IDEMPOTENCY_CONFLICT,
          "Idempotency key already belongs to another order",
        );
      }

      return serializeOrder(existingOrder);
    }
  }

  const createdOrderId = await prisma.$transaction(async (tx) => {
    const quote = await buildCheckoutQuote(
      {
        userId,
      },
      {
        shippingMethod: dto.shippingMethod,
        voucherCodes: dto.voucherCodes,
      },
      tx,
    );
    const shippingAddress = await resolveShippingAddress(tx, userId, dto);
    const customerSnapshot = await getUserCustomerSnapshot(tx, userId);
    const order = await tx.order.create({
      data: {
        orderNumber: createOrderNumber(),
        userId,
        addressId: shippingAddress.addressId,
        customerSnapshot,
        addressSnapshot: {
          recipientName: shippingAddress.recipientName,
          phone: shippingAddress.phone,
          addressLine1: shippingAddress.addressLine1,
          addressLine2: shippingAddress.addressLine2,
          district: shippingAddress.district,
          city: shippingAddress.city,
          postalCode: shippingAddress.postalCode,
          notes: shippingAddress.notes,
        },
        subtotal: quote.preview.subtotal,
        currency: quote.preview.currency,
        productDiscountTotal: quote.preview.productDiscountTotal,
        voucherDiscountTotal: quote.preview.voucherDiscountTotal,
        shippingCost: quote.preview.shippingCost,
        grandTotal: quote.preview.grandTotal,
        status: "PENDING_PAYMENT",
        shippingMethod: quote.preview.shippingMethod,
        shippingEtaDays: quote.preview.shippingEtaDays,
        idempotencyKey: idempotencyKey ?? null,
        items: {
          create: quote.preview.items.map((item) => ({
            productId: item.productId,
            productVariantId: item.productVariantId,
            productNameSnapshot: item.productName,
            variantLabelSnapshot: item.variantLabel,
            unitPriceSnapshot: item.unitPrice,
            qty: item.qty,
            lineDiscountSnapshot: 0,
            lineSubtotalSnapshot: item.lineSubtotal,
          })),
        },
      },
      select: {
        id: true,
      },
    });

    for (const item of quote.preview.items) {
      await tx.stockReservation.create({
        data: {
          orderId: order.id,
          productVariantId: item.productVariantId,
          qty: item.qty,
          status: "ACTIVE",
        },
      });
      await createStockMovement(tx, {
        orderId: order.id,
        actorId: userId,
        type: "ORDER_RESERVE",
        qty: -item.qty,
        productVariantId: item.productVariantId,
        reason: "Order placed; stock reserved pending payment confirmation",
      });
    }

    await tx.payment.create({
      data: {
        orderId: order.id,
        method: dto.paymentMethod,
        amount: quote.preview.grandTotal,
        status: "PENDING",
      },
    });

    for (const promotion of quote.appliedPromotionRecords) {
      await tx.promotionUsage.create({
        data: {
          promotionId: promotion.promotionId,
          orderId: order.id,
          userId,
        },
      });
      await tx.promotion.update({
        where: {
          id: promotion.promotionId,
        },
        data: {
          totalUsed: {
            increment: 1,
          },
        },
      });
    }

    await tx.cart.update({
      where: {
        id: quote.cart.id,
      },
      data: {
        status: "CONVERTED",
      },
    });

    await tx.auditLog.create({
      data: {
        actorType: "CUSTOMER",
        actorId: userId,
        entityType: "ORDER",
        entityId: order.id,
        action: "ORDER_PLACED",
        afterJson: {
          orderId: order.id,
          grandTotal: quote.preview.grandTotal,
        },
      },
    });

    return order.id;
  });

  return getMyOrderById(createdOrderId, userId);
}

export async function listMyOrders(userId: string, query: OrderListQuery) {
  const where: Prisma.OrderWhereInput = {
    userId,
    ...buildOrderWhere(query),
  };
  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: {
        placedAt: "desc",
      },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
      include: orderListInclude,
    }),
    prisma.order.count({
      where,
    }),
  ]);

  return {
    orders: orders.map(serializeOrder),
    total,
  };
}

export async function getMyOrderById(orderId: string, userId: string) {
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId,
    },
    include: orderDetailInclude,
  });

  if (!order) {
    throw new AppError(404, ErrorCodes.NOT_FOUND, "Order not found");
  }

  return serializeOrder(order);
}

export async function listAdminOrders(query: OrderListQuery) {
  const where = buildOrderWhere(query);
  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: {
        placedAt: "desc",
      },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
      include: orderListInclude,
    }),
    prisma.order.count({
      where,
    }),
  ]);

  return {
    orders: orders.map(serializeOrder),
    total,
  };
}

export async function getAdminOrderById(orderId: string) {
  const order = await prisma.order.findUnique({
    where: {
      id: orderId,
    },
    include: orderDetailInclude,
  });

  if (!order) {
    throw new AppError(404, ErrorCodes.NOT_FOUND, "Order not found");
  }

  return serializeOrder(order);
}

export async function updateOrderStatus(
  orderId: string,
  dto: UpdateOrderStatusDto,
  actorId: string,
) {
  const updatedOrderId = await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: {
        id: orderId,
      },
      include: {
        reservations: true,
      },
    });

    if (!order) {
      throw new AppError(404, ErrorCodes.NOT_FOUND, "Order not found");
    }

    if (!isValidStatusTransition(order.status, dto.status)) {
      throw new AppError(
        400,
        ErrorCodes.ORDER_STATUS_TRANSITION_INVALID,
        `Cannot transition order from ${order.status} to ${dto.status}`,
      );
    }

    if (dto.status === "PAYMENT_REVIEW") {
      await syncPaymentStatusForOrder(tx, orderId, dto.status);
    }

    if (dto.status === "PENDING_PAYMENT") {
      await syncPaymentStatusForOrder(tx, orderId, dto.status);
    }

    if (dto.status === "PAID") {
      await consumeReservationsForPayment(tx, orderId, actorId);
      await syncPaymentStatusForOrder(tx, orderId, dto.status);
    }

    if (dto.status === "CANCELLED") {
      await updateReservationsForCancellation(tx, orderId, actorId);
      await syncPaymentStatusForOrder(tx, orderId, dto.status);
    }

    await tx.order.update({
      where: {
        id: orderId,
      },
      data: {
        status: dto.status,
      },
    });

    await tx.auditLog.create({
      data: {
        actorType: "ADMIN",
        actorId,
        entityType: "ORDER",
        entityId: orderId,
        action: "ORDER_STATUS_CHANGED",
        beforeJson: {
          status: order.status,
        },
        afterJson: {
          status: dto.status,
          note: dto.note ?? null,
        },
      },
    });

    return order.id;
  });

  return getAdminOrderById(updatedOrderId);
}
