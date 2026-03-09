import { ErrorCodes, type PlaceOrderDto } from "@/shared/contracts";

const checkoutMocks = vi.hoisted(() => ({
  buildCheckoutQuote: vi.fn(),
}));

const prismaMocks = vi.hoisted(() => ({
  prisma: {
    order: {
      findUnique: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock("@/server/checkout", () => checkoutMocks);
vi.mock("@/server/db", () => prismaMocks);

import { placeOrder } from "../service";

const baseOrderInput: PlaceOrderDto = {
  shippingMethod: "INTERNAL_FLAT",
  paymentMethod: "MANUAL_TRANSFER",
  voucherCodes: ["PROMO10"],
  shippingAddress: {
    recipientName: "Test User",
    phone: "+628123456789",
    addressLine1: "Jl. Testing No. 1",
  },
};

function createExistingOrder(userId: string) {
  return {
    id: "cmforder000000000000000001",
    userId,
    orderNumber: "ORD-TEST-001",
    status: "PENDING_PAYMENT",
    currency: "IDR",
    subtotal: 240000,
    productDiscountTotal: 0,
    voucherDiscountTotal: 10000,
    shippingCost: 20000,
    grandTotal: 250000,
    shippingMethod: "INTERNAL_FLAT",
    shippingEtaDays: 2,
    idempotencyKey: "idem-1",
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
        amount: 250000,
        status: "PENDING",
        createdAt: new Date("2026-03-10T00:00:00.000Z"),
        updatedAt: new Date("2026-03-10T00:00:00.000Z"),
        submittedAt: null,
        confirmedAt: null,
        proofs: [],
      },
    ],
    promotions: [],
    reservations: [],
    addressId: null,
    placedAt: new Date("2026-03-10T00:00:00.000Z"),
    createdAt: new Date("2026-03-10T00:00:00.000Z"),
    updatedAt: new Date("2026-03-10T00:00:00.000Z"),
  };
}

describe("placeOrder idempotency", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the existing order for the same user and idempotency key", async () => {
    prismaMocks.prisma.order.findUnique.mockResolvedValue(
      createExistingOrder("cmfuser000000000000000001"),
    );

    const result = await placeOrder(
      "cmfuser000000000000000001",
      baseOrderInput,
      "idem-1",
    );

    expect(prismaMocks.prisma.order.findUnique).toHaveBeenCalledWith({
      where: {
        idempotencyKey: "idem-1",
      },
      include: expect.any(Object),
    });
    expect(prismaMocks.prisma.$transaction).not.toHaveBeenCalled();
    expect(checkoutMocks.buildCheckoutQuote).not.toHaveBeenCalled();
    expect(result).toMatchObject({
      id: "cmforder000000000000000001",
      orderNumber: "ORD-TEST-001",
      itemCount: 2,
      latestPayment: {
        id: "cmfpayment000000000000001",
        status: "PENDING",
      },
    });
  });

  it("rejects idempotency keys that already belong to another user", async () => {
    prismaMocks.prisma.order.findUnique.mockResolvedValue(
      createExistingOrder("cmfotheruser0000000000001"),
    );

    await expect(
      placeOrder("cmfuser000000000000000001", baseOrderInput, "idem-1"),
    ).rejects.toMatchObject({
      statusCode: 409,
      code: ErrorCodes.CHECKOUT_IDEMPOTENCY_CONFLICT,
    });
    expect(prismaMocks.prisma.$transaction).not.toHaveBeenCalled();
    expect(checkoutMocks.buildCheckoutQuote).not.toHaveBeenCalled();
  });
});
