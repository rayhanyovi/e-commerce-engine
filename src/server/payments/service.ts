import { Prisma } from "@prisma/client";

import {
  ErrorCodes,
  StoreConfigKeys,
  type PaymentReviewQueueQuery,
  type ReviewPaymentDto,
  type UploadPaymentProofDto,
} from "@/shared/contracts";
import type { AuthRole } from "@/server/auth/types";
import { prisma } from "@/server/db";
import { AppError } from "@/server/http";
import { updateOrderStatus } from "@/server/orders";
import { getStoreConfigSnapshot } from "@/server/store-config";

type PaymentActor = {
  id: string;
  role: AuthRole;
};

const reviewQueueInclude = {
  order: {
    select: {
      id: true,
      userId: true,
      orderNumber: true,
      status: true,
      grandTotal: true,
      currency: true,
      placedAt: true,
    },
  },
  proofs: {
    orderBy: {
      uploadedAt: "desc",
    },
    include: {
      uploadedBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  },
} satisfies Prisma.PaymentInclude;

type ReviewQueueRecord = Prisma.PaymentGetPayload<{
  include: typeof reviewQueueInclude;
}>;

function serializePaymentRecord(payment: ReviewQueueRecord) {
  return {
    ...payment,
    latestProof: payment.proofs[0] ?? null,
    proofCount: payment.proofs.length,
  };
}

async function getAccessibleOrderForInstructions(
  orderId: string,
  actor: PaymentActor,
) {
  const order = await prisma.order.findFirst({
    where:
      actor.role === "ADMIN"
        ? {
            id: orderId,
          }
        : {
            id: orderId,
            userId: actor.id,
          },
    select: {
      id: true,
      orderNumber: true,
      grandTotal: true,
      currency: true,
      payments: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
        include: {
          proofs: {
            orderBy: {
              uploadedAt: "desc",
            },
          },
        },
      },
    },
  });

  if (!order) {
    throw new AppError(404, ErrorCodes.NOT_FOUND, "Order not found");
  }

  const payment = order.payments[0];

  if (!payment) {
    throw new AppError(404, ErrorCodes.NOT_FOUND, "Payment not found for order");
  }

  return {
    order,
    payment,
  };
}

export async function getPaymentInstructions(orderId: string, actor: PaymentActor) {
  const [{ order, payment }, configSnapshot] = await Promise.all([
    getAccessibleOrderForInstructions(orderId, actor),
    getStoreConfigSnapshot([StoreConfigKeys.PAYMENT_TRANSFER_INSTRUCTIONS]),
  ]);

  return {
    orderId: order.id,
    orderNumber: order.orderNumber,
    amount: payment.amount ?? order.grandTotal,
    currency: order.currency,
    paymentMethod: payment.method,
    paymentStatus: payment.status,
    instructions:
      configSnapshot.get(StoreConfigKeys.PAYMENT_TRANSFER_INSTRUCTIONS) ??
      "Transfer ke rekening toko yang sudah ditentukan.",
    proofCount: payment.proofs.length,
  };
}

export async function uploadPaymentProof(
  orderId: string,
  dto: UploadPaymentProofDto,
  actor: PaymentActor,
) {
  const result = await prisma.$transaction(async (tx) => {
    const order = await tx.order.findFirst({
      where: {
        id: orderId,
        userId: actor.id,
      },
      select: {
        id: true,
        status: true,
        payments: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
    });

    if (!order) {
      throw new AppError(404, ErrorCodes.NOT_FOUND, "Order not found");
    }

    if (!["PENDING_PAYMENT", "PAYMENT_REVIEW"].includes(order.status)) {
      throw new AppError(
        400,
        ErrorCodes.PAYMENT_PROOF_INVALID,
        "Payment proof can only be uploaded for pending payment orders",
      );
    }

    const payment = order.payments[0];

    if (!payment) {
      throw new AppError(404, ErrorCodes.NOT_FOUND, "Payment not found for order");
    }

    if (payment.status === "CONFIRMED") {
      throw new AppError(
        400,
        ErrorCodes.PAYMENT_ALREADY_CONFIRMED,
        "Payment already confirmed",
      );
    }

    const proof = await tx.paymentProof.create({
      data: {
        paymentId: payment.id,
        filePath: dto.filePath,
        fileName: dto.fileName ?? null,
        mimeType: dto.mimeType ?? null,
        fileSize: dto.fileSize ?? null,
        uploadedByUserId: actor.id,
        note: dto.note ?? null,
      },
    });

    await tx.payment.update({
      where: {
        id: payment.id,
      },
      data: {
        status: "SUBMITTED",
        submittedAt: new Date(),
        confirmedAt: null,
      },
    });

    if (order.status !== "PAYMENT_REVIEW") {
      await tx.order.update({
        where: {
          id: order.id,
        },
        data: {
          status: "PAYMENT_REVIEW",
        },
      });
    }

    await tx.auditLog.create({
      data: {
        actorType: "CUSTOMER",
        actorId: actor.id,
        entityType: "PAYMENT",
        entityId: payment.id,
        action: "PAYMENT_PROOF_UPLOADED",
        beforeJson: {
          paymentStatus: payment.status,
          orderStatus: order.status,
        },
        afterJson: {
          paymentStatus: "SUBMITTED",
          orderStatus: "PAYMENT_REVIEW",
          proofId: proof.id,
          filePath: proof.filePath,
          fileName: proof.fileName,
        },
      },
    });

    return {
      paymentId: payment.id,
      paymentStatus: "SUBMITTED" as const,
      orderId: order.id,
      orderStatus: "PAYMENT_REVIEW" as const,
      proof,
    };
  });

  return result;
}

export async function listAdminPaymentReviewQueue(query: PaymentReviewQueueQuery) {
  const where: Prisma.PaymentWhereInput = {
    status: query.status
      ? query.status
      : {
          in: ["SUBMITTED", "UNDER_REVIEW"],
        },
  };

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      include: reviewQueueInclude,
      orderBy: [{ submittedAt: "asc" }, { createdAt: "asc" }],
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
    prisma.payment.count({
      where,
    }),
  ]);

  return {
    payments: payments.map(serializePaymentRecord),
    total,
  };
}

export async function getAdminPaymentById(paymentId: string) {
  const payment = await prisma.payment.findUnique({
    where: {
      id: paymentId,
    },
    include: reviewQueueInclude,
  });

  if (!payment) {
    throw new AppError(404, ErrorCodes.NOT_FOUND, "Payment not found");
  }

  return serializePaymentRecord(payment);
}

export async function reviewPayment(
  paymentId: string,
  dto: ReviewPaymentDto,
  adminId: string,
) {
  const payment = await prisma.payment.findUnique({
    where: {
      id: paymentId,
    },
    include: {
      order: {
        select: {
          id: true,
          status: true,
        },
      },
      proofs: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!payment) {
    throw new AppError(404, ErrorCodes.NOT_FOUND, "Payment not found");
  }

  if (!payment.proofs.length) {
    throw new AppError(
      400,
      ErrorCodes.PAYMENT_PROOF_INVALID,
      "Payment proof is required before review",
    );
  }

  if (!["SUBMITTED", "UNDER_REVIEW"].includes(payment.status)) {
    if (payment.status === "CONFIRMED") {
      throw new AppError(
        400,
        ErrorCodes.PAYMENT_ALREADY_CONFIRMED,
        "Payment already confirmed",
      );
    }

    throw new AppError(
      400,
      ErrorCodes.PAYMENT_PROOF_INVALID,
      "Payment is not waiting for review",
    );
  }

  if (payment.order.status === "CANCELLED") {
    throw new AppError(
      400,
      ErrorCodes.ORDER_STATUS_TRANSITION_INVALID,
      "Cancelled orders cannot be reviewed for payment confirmation",
    );
  }

  let currentOrderStatus = payment.order.status;

  if (currentOrderStatus === "PENDING_PAYMENT") {
    await updateOrderStatus(
      payment.order.id,
      {
        status: "PAYMENT_REVIEW",
        note: "Payment review triggered from admin payments queue",
      },
      adminId,
    );
    currentOrderStatus = "PAYMENT_REVIEW";
  }

  const targetStatus = dto.decision === "CONFIRMED" ? "PAID" : "PENDING_PAYMENT";

  if (currentOrderStatus !== targetStatus) {
    await updateOrderStatus(
      payment.order.id,
      {
        status: targetStatus,
        note: dto.note,
      },
      adminId,
    );
    currentOrderStatus = targetStatus;
  } else if (dto.decision === "CONFIRMED" && payment.status !== "CONFIRMED") {
    await prisma.payment.update({
      where: {
        id: paymentId,
      },
      data: {
        status: "CONFIRMED",
        confirmedAt: payment.confirmedAt ?? new Date(),
      },
    });
  } else if (dto.decision === "REJECTED" && payment.status !== "REJECTED") {
    await prisma.payment.update({
      where: {
        id: paymentId,
      },
      data: {
        status: "REJECTED",
      },
    });
  }

  await prisma.auditLog.create({
    data: {
      actorType: "ADMIN",
      actorId: adminId,
      entityType: "PAYMENT",
      entityId: paymentId,
      action: dto.decision === "CONFIRMED" ? "PAYMENT_CONFIRMED" : "PAYMENT_REJECTED",
      beforeJson: {
        paymentStatus: payment.status,
        orderStatus: payment.order.status,
      },
      afterJson: {
        paymentStatus: dto.decision === "CONFIRMED" ? "CONFIRMED" : "REJECTED",
        orderStatus: currentOrderStatus,
        note: dto.note ?? null,
      },
    },
  });

  return getAdminPaymentById(paymentId);
}
