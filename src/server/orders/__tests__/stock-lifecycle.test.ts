import type { PlaceOrderDto, UpdateOrderStatusDto } from "@/shared/contracts";

const checkoutMocks = vi.hoisted(() => ({
  buildCheckoutQuote: vi.fn(),
}));

const prismaMocks = vi.hoisted(() => ({
  prisma: {
    $transaction: vi.fn(),
    order: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("@/server/checkout", () => checkoutMocks);
vi.mock("@/server/db", () => prismaMocks);

import { placeOrder, updateOrderStatus } from "../service";

const placeOrderInput: PlaceOrderDto = {
  shippingMethod: "INTERNAL_FLAT",
  paymentMethod: "MANUAL_TRANSFER",
  voucherCodes: [],
  shippingAddress: {
    recipientName: "Test User",
    phone: "+628123456789",
    addressLine1: "Jl. Testing No. 1",
    city: "Jakarta",
  },
};

const cancelOrderInput: UpdateOrderStatusDto = {
  status: "CANCELLED",
  note: "Customer requested cancellation",
};

function createOrderDetail(input?: {
  status?: "PENDING_PAYMENT" | "CANCELLED";
  paymentStatus?: "PENDING" | "CONFIRMED";
  reservations?: Array<{
    id: string;
    orderId: string;
    productVariantId: string;
    qty: number;
    status: "ACTIVE" | "CONSUMED" | "RELEASED";
    createdAt?: Date;
    updatedAt?: Date;
  }>;
}) {
  const status = input?.status ?? "PENDING_PAYMENT";
  const paymentStatus = input?.paymentStatus ?? "PENDING";

  return {
    id: "cmforder000000000000000001",
    userId: "cmfuser000000000000000001",
    orderNumber: "ORD-TEST-001",
    status,
    currency: "IDR",
    subtotal: 240000,
    productDiscountTotal: 0,
    voucherDiscountTotal: 0,
    shippingCost: 20000,
    grandTotal: 260000,
    shippingMethod: "INTERNAL_FLAT",
    shippingEtaDays: 2,
    idempotencyKey: null,
    addressId: null,
    customerSnapshot: {
      name: "Test User",
      email: "test@example.com",
      phone: "+628123456789",
    },
    addressSnapshot: {
      recipientName: "Test User",
      phone: "+628123456789",
      addressLine1: "Jl. Testing No. 1",
      addressLine2: null,
      district: null,
      city: "Jakarta",
      postalCode: null,
      notes: null,
    },
    items: [
      {
        id: "cmforderitem0000000000001",
        orderId: "cmforder000000000000000001",
        productId: "cmfproduct000000000000001",
        productVariantId: "cmfvariant000000000000001",
        productNameSnapshot: "Canvas Sneaker",
        variantLabelSnapshot: "Size: 42",
        unitPriceSnapshot: 120000,
        qty: 2,
        lineDiscountSnapshot: 0,
        lineSubtotalSnapshot: 240000,
      },
    ],
    payments: [
      {
        id: "cmfpayment000000000000001",
        orderId: "cmforder000000000000000001",
        method: "MANUAL_TRANSFER",
        amount: 260000,
        status: paymentStatus,
        createdAt: new Date("2026-03-10T00:00:00.000Z"),
        updatedAt: new Date("2026-03-10T00:00:00.000Z"),
        submittedAt: null,
        confirmedAt:
          paymentStatus === "CONFIRMED"
            ? new Date("2026-03-10T01:00:00.000Z")
            : null,
        proofs: [],
      },
    ],
    promotions: [],
    reservations:
      input?.reservations ??
      [
        {
          id: "cmfreservation000000000001",
          orderId: "cmforder000000000000000001",
          productVariantId: "cmfvariant000000000000001",
          qty: 2,
          status: "ACTIVE" as const,
          createdAt: new Date("2026-03-10T00:00:00.000Z"),
          updatedAt: new Date("2026-03-10T00:00:00.000Z"),
        },
      ],
    placedAt: new Date("2026-03-10T00:00:00.000Z"),
    createdAt: new Date("2026-03-10T00:00:00.000Z"),
    updatedAt: new Date("2026-03-10T00:00:00.000Z"),
  };
}

describe("order stock lifecycle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates active stock reservations and reserve movements when placing an order", async () => {
    const tx = {
      user: {
        findUnique: vi.fn().mockResolvedValue({
          id: "cmfuser000000000000000001",
          name: "Test User",
          email: "test@example.com",
          phone: "+628123456789",
        }),
      },
      order: {
        create: vi.fn().mockResolvedValue({
          id: "cmforder000000000000000001",
        }),
      },
      stockReservation: {
        create: vi.fn(),
      },
      stockMovement: {
        create: vi.fn(),
      },
      payment: {
        create: vi.fn(),
      },
      promotionUsage: {
        create: vi.fn(),
      },
      promotion: {
        update: vi.fn(),
      },
      cart: {
        update: vi.fn(),
      },
      auditLog: {
        create: vi.fn(),
      },
    };

    checkoutMocks.buildCheckoutQuote.mockResolvedValue({
      cart: {
        id: "cmfcart000000000000000001",
      },
      preview: {
        items: [
          {
            productId: "cmfproduct000000000000001",
            productVariantId: "cmfvariant000000000000001",
            productName: "Canvas Sneaker",
            variantLabel: "Size: 42",
            unitPrice: 120000,
            qty: 2,
            lineSubtotal: 240000,
          },
        ],
        currency: "IDR",
        subtotal: 240000,
        productDiscountTotal: 0,
        voucherDiscountTotal: 0,
        shippingCost: 20000,
        grandTotal: 260000,
        appliedVouchers: [],
        rejectedVouchers: [],
        shippingMethod: "INTERNAL_FLAT",
        shippingEtaDays: 2,
      },
      appliedPromotionRecords: [],
    });
    prismaMocks.prisma.$transaction.mockImplementation(async (callback: never) =>
      callback(tx),
    );
    prismaMocks.prisma.order.findFirst.mockResolvedValue(createOrderDetail());

    const result = await placeOrder("cmfuser000000000000000001", placeOrderInput);

    expect(tx.order.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: "cmfuser000000000000000001",
        status: "PENDING_PAYMENT",
        shippingMethod: "INTERNAL_FLAT",
        shippingEtaDays: 2,
        subtotal: 240000,
        grandTotal: 260000,
      }),
      select: {
        id: true,
      },
    });
    expect(tx.stockReservation.create).toHaveBeenCalledWith({
      data: {
        orderId: "cmforder000000000000000001",
        productVariantId: "cmfvariant000000000000001",
        qty: 2,
        status: "ACTIVE",
      },
    });
    expect(tx.stockMovement.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        productVariantId: "cmfvariant000000000000001",
        type: "ORDER_RESERVE",
        qty: -2,
        referenceId: "cmforder000000000000000001",
        actorId: "cmfuser000000000000000001",
      }),
    });
    expect(tx.payment.create).toHaveBeenCalledWith({
      data: {
        orderId: "cmforder000000000000000001",
        method: "MANUAL_TRANSFER",
        amount: 260000,
        status: "PENDING",
      },
    });
    expect(tx.cart.update).toHaveBeenCalledWith({
      where: {
        id: "cmfcart000000000000000001",
      },
      data: {
        status: "CONVERTED",
      },
    });
    expect(result).toMatchObject({
      id: "cmforder000000000000000001",
      status: "PENDING_PAYMENT",
      itemCount: 2,
      latestPayment: {
        status: "PENDING",
      },
    });
  });

  it("releases consumed stock back to inventory when a paid order is cancelled", async () => {
    const tx = {
      order: {
        findUnique: vi.fn().mockResolvedValue({
          id: "cmforder000000000000000001",
          status: "PAID",
          reservations: [
            {
              id: "cmfreservation000000000001",
              orderId: "cmforder000000000000000001",
              productVariantId: "cmfvariant000000000000001",
              qty: 2,
              status: "CONSUMED",
            },
          ],
        }),
        update: vi.fn(),
      },
      stockReservation: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: "cmfreservation000000000001",
            orderId: "cmforder000000000000000001",
            productVariantId: "cmfvariant000000000000001",
            qty: 2,
            status: "CONSUMED",
          },
        ]),
        update: vi.fn(),
      },
      productVariant: {
        update: vi.fn(),
      },
      stockMovement: {
        create: vi.fn(),
      },
      payment: {
        findFirst: vi.fn().mockResolvedValue({
          id: "cmfpayment000000000000001",
          status: "CONFIRMED",
          confirmedAt: new Date("2026-03-10T01:00:00.000Z"),
        }),
        update: vi.fn(),
      },
      auditLog: {
        create: vi.fn(),
      },
    };

    prismaMocks.prisma.$transaction.mockImplementation(async (callback: never) =>
      callback(tx),
    );
    prismaMocks.prisma.order.findUnique.mockResolvedValue(
      createOrderDetail({
        status: "CANCELLED",
        paymentStatus: "CONFIRMED",
        reservations: [
          {
            id: "cmfreservation000000000001",
            orderId: "cmforder000000000000000001",
            productVariantId: "cmfvariant000000000000001",
            qty: 2,
            status: "RELEASED",
          },
        ],
      }),
    );

    const result = await updateOrderStatus(
      "cmforder000000000000000001",
      cancelOrderInput,
      "cmfadmin000000000000000001",
    );

    expect(tx.productVariant.update).toHaveBeenCalledWith({
      where: {
        id: "cmfvariant000000000000001",
      },
      data: {
        stockOnHand: {
          increment: 2,
        },
      },
    });
    expect(tx.stockReservation.update).toHaveBeenCalledWith({
      where: {
        id: "cmfreservation000000000001",
      },
      data: {
        status: "RELEASED",
      },
    });
    expect(tx.stockMovement.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        type: "ORDER_CANCEL_RELEASE",
        qty: 2,
        referenceId: "cmforder000000000000000001",
        actorId: "cmfadmin000000000000000001",
      }),
    });
    expect(tx.payment.update).not.toHaveBeenCalled();
    expect(tx.order.update).toHaveBeenCalledWith({
      where: {
        id: "cmforder000000000000000001",
      },
      data: {
        status: "CANCELLED",
      },
    });
    expect(result).toMatchObject({
      id: "cmforder000000000000000001",
      status: "CANCELLED",
      latestPayment: {
        status: "CONFIRMED",
      },
      reservations: [
        expect.objectContaining({
          status: "RELEASED",
        }),
      ],
    });
  });
});
