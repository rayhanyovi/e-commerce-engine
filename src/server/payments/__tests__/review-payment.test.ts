import { ErrorCodes } from "@/shared/contracts";

const orderMocks = vi.hoisted(() => ({
  updateOrderStatus: vi.fn(),
}));

const prismaMocks = vi.hoisted(() => ({
  prisma: {
    payment: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
    },
  },
}));

vi.mock("@/server/db", () => prismaMocks);
vi.mock("@/server/orders", () => orderMocks);

import { reviewPayment } from "../service";

function createPaymentRecord(input?: {
  paymentStatus?: "SUBMITTED" | "UNDER_REVIEW" | "CONFIRMED" | "REJECTED";
  orderStatus?:
    | "PENDING_PAYMENT"
    | "PAYMENT_REVIEW"
    | "PAID"
    | "CANCELLED";
  proofCount?: number;
}) {
  const paymentStatus = input?.paymentStatus ?? "SUBMITTED";
  const orderStatus = input?.orderStatus ?? "PAYMENT_REVIEW";
  const proofCount = input?.proofCount ?? 1;

  return {
    id: "cmfpayment000000000000001",
    orderId: "cmforder000000000000000001",
    method: "MANUAL_TRANSFER",
    amount: 250000,
    status: paymentStatus,
    submittedAt: new Date("2026-03-10T00:00:00.000Z"),
    confirmedAt: paymentStatus === "CONFIRMED" ? new Date("2026-03-10T01:00:00.000Z") : null,
    createdAt: new Date("2026-03-10T00:00:00.000Z"),
    updatedAt: new Date("2026-03-10T00:00:00.000Z"),
    order: {
      id: "cmforder000000000000000001",
      userId: "cmfuser000000000000000001",
      orderNumber: "ORD-TEST-001",
      status: orderStatus,
      grandTotal: 250000,
      currency: "IDR",
      placedAt: new Date("2026-03-10T00:00:00.000Z"),
    },
    proofs: Array.from({ length: proofCount }, (_, index) => ({
      id: `cmfproof00000000000000${index + 1}`,
      paymentId: "cmfpayment000000000000001",
      filePath: `https://cdn.example.com/proof-${index + 1}.png`,
      fileName: `proof-${index + 1}.png`,
      mimeType: "image/png",
      fileSize: 1024,
      note: null,
      uploadedAt: new Date("2026-03-10T00:00:00.000Z"),
      uploadedByUserId: "cmfuser000000000000000001",
      uploadedBy: {
        id: "cmfuser000000000000000001",
        name: "Customer",
        email: "customer@example.com",
      },
    })),
  };
}

describe("reviewPayment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("confirms a submitted payment and advances the linked order to paid", async () => {
    prismaMocks.prisma.payment.findUnique
      .mockResolvedValueOnce(
        createPaymentRecord({
          paymentStatus: "SUBMITTED",
          orderStatus: "PENDING_PAYMENT",
        }),
      )
      .mockResolvedValueOnce(
        createPaymentRecord({
          paymentStatus: "CONFIRMED",
          orderStatus: "PAID",
        }),
      );

    const result = await reviewPayment(
      "cmfpayment000000000000001",
      {
        decision: "CONFIRMED",
        note: "Transfer amount is correct",
      },
      "cmfadmin000000000000000001",
    );

    expect(orderMocks.updateOrderStatus).toHaveBeenNthCalledWith(
      1,
      "cmforder000000000000000001",
      {
        status: "PAYMENT_REVIEW",
        note: "Payment review triggered from admin payments queue",
      },
      "cmfadmin000000000000000001",
    );
    expect(orderMocks.updateOrderStatus).toHaveBeenNthCalledWith(
      2,
      "cmforder000000000000000001",
      {
        status: "PAID",
        note: "Transfer amount is correct",
      },
      "cmfadmin000000000000000001",
    );
    expect(prismaMocks.prisma.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        actorId: "cmfadmin000000000000000001",
        entityId: "cmfpayment000000000000001",
        action: "PAYMENT_CONFIRMED",
      }),
    });
    expect(result).toMatchObject({
      id: "cmfpayment000000000000001",
      status: "CONFIRMED",
      proofCount: 1,
      latestProof: {
        id: "cmfproof000000000000001",
      },
      order: {
        status: "PAID",
      },
    });
  });

  it("rejects an in-review payment and sends the order back to pending payment", async () => {
    prismaMocks.prisma.payment.findUnique
      .mockResolvedValueOnce(
        createPaymentRecord({
          paymentStatus: "UNDER_REVIEW",
          orderStatus: "PAYMENT_REVIEW",
        }),
      )
      .mockResolvedValueOnce(
        createPaymentRecord({
          paymentStatus: "REJECTED",
          orderStatus: "PENDING_PAYMENT",
        }),
      );

    const result = await reviewPayment(
      "cmfpayment000000000000001",
      {
        decision: "REJECTED",
        note: "Proof image is unreadable",
      },
      "cmfadmin000000000000000001",
    );

    expect(orderMocks.updateOrderStatus).toHaveBeenCalledTimes(1);
    expect(orderMocks.updateOrderStatus).toHaveBeenCalledWith(
      "cmforder000000000000000001",
      {
        status: "PENDING_PAYMENT",
        note: "Proof image is unreadable",
      },
      "cmfadmin000000000000000001",
    );
    expect(prismaMocks.prisma.payment.update).not.toHaveBeenCalled();
    expect(prismaMocks.prisma.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: "PAYMENT_REJECTED",
      }),
    });
    expect(result).toMatchObject({
      status: "REJECTED",
      order: {
        status: "PENDING_PAYMENT",
      },
    });
  });

  it("rejects payment review attempts when no proof has been uploaded", async () => {
    prismaMocks.prisma.payment.findUnique.mockResolvedValue(
      createPaymentRecord({
        paymentStatus: "SUBMITTED",
        orderStatus: "PAYMENT_REVIEW",
        proofCount: 0,
      }),
    );

    await expect(
      reviewPayment(
        "cmfpayment000000000000001",
        {
          decision: "CONFIRMED",
        },
        "cmfadmin000000000000000001",
      ),
    ).rejects.toMatchObject({
      statusCode: 400,
      code: ErrorCodes.PAYMENT_PROOF_INVALID,
    });
    expect(orderMocks.updateOrderStatus).not.toHaveBeenCalled();
    expect(prismaMocks.prisma.auditLog.create).not.toHaveBeenCalled();
  });
});
