import { NextRequest, NextResponse } from "next/server";

import { AppError } from "@/server/http";

const authMocks = vi.hoisted(() => ({
  requireUser: vi.fn(),
}));

const cartMocks = vi.hoisted(() => ({
  applyCartSessionCookie: vi.fn((response: NextResponse) => response),
  requireCartIdentity: vi.fn((session: unknown) => session),
  resolveCartSession: vi.fn(),
}));

const checkoutMocks = vi.hoisted(() => ({
  getCheckoutPreview: vi.fn(),
}));

const ordersMocks = vi.hoisted(() => ({
  listMyOrders: vi.fn(),
  placeOrder: vi.fn(),
}));

vi.mock("@/server/auth", () => authMocks);
vi.mock("@/server/cart", () => cartMocks);
vi.mock("@/server/checkout", () => checkoutMocks);
vi.mock("@/server/orders", () => ordersMocks);

import { POST as checkoutPreviewPost } from "../../app/api/checkout/preview/route";
import { GET as myOrdersGet, POST as placeOrderPost } from "../../app/api/orders/route";

describe("commerce route handlers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns checkout preview for an authenticated cart session", async () => {
    const user = {
      id: "cmfcommerceuser00000000001",
      role: "CUSTOMER" as const,
      email: "checkout@example.com",
      name: "Checkout User",
      phone: null,
    };
    const session = {
      userId: user.id,
      guestToken: null,
    };
    const preview = {
      items: [],
      currency: "IDR",
      subtotal: 100_000,
      productDiscountTotal: 10_000,
      voucherDiscountTotal: 5_000,
      shippingCost: 20_000,
      grandTotal: 115_000,
      appliedVouchers: [],
      rejectedVouchers: [],
      shippingMethod: "INTERNAL_FLAT" as const,
      shippingEtaDays: 2,
    };

    authMocks.requireUser.mockResolvedValue(user);
    cartMocks.resolveCartSession.mockResolvedValue(session);
    checkoutMocks.getCheckoutPreview.mockResolvedValue(preview);

    const response = await checkoutPreviewPost(
      new NextRequest("http://localhost/api/checkout/preview", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          voucherCodes: ["PROMO10"],
          shippingMethod: "INTERNAL_FLAT",
        }),
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toMatchObject({
      success: true,
      data: preview,
    });
    expect(authMocks.requireUser).toHaveBeenCalled();
    expect(cartMocks.resolveCartSession).toHaveBeenCalled();
    expect(cartMocks.requireCartIdentity).toHaveBeenCalledWith(session);
    expect(checkoutMocks.getCheckoutPreview).toHaveBeenCalledWith(session, {
      voucherCodes: ["PROMO10"],
      shippingMethod: "INTERNAL_FLAT",
    });
    expect(cartMocks.applyCartSessionCookie).toHaveBeenCalledWith(
      expect.any(NextResponse),
      session,
    );
  });

  it("returns 401 when checkout preview is requested without authentication", async () => {
    authMocks.requireUser.mockRejectedValue(
      new AppError(401, "UNAUTHORIZED", "Authentication required"),
    );

    const response = await checkoutPreviewPost(
      new NextRequest("http://localhost/api/checkout/preview", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          voucherCodes: [],
          shippingMethod: "INTERNAL_FLAT",
        }),
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(401);
    expect(payload.success).toBe(false);
    expect(payload.error.code).toBe("UNAUTHORIZED");
  });

  it("lists customer orders with parsed query params", async () => {
    const user = {
      id: "cmfcommerceuser00000000002",
      role: "CUSTOMER" as const,
      email: "orders@example.com",
      name: "Orders User",
      phone: null,
    };

    authMocks.requireUser.mockResolvedValue(user);
    ordersMocks.listMyOrders.mockResolvedValue({
      orders: [{ id: "order_1", orderNumber: "ORD-1" }],
      total: 1,
    });

    const response = await myOrdersGet(
      new NextRequest(
        "http://localhost/api/orders?page=2&pageSize=5&status=PENDING_PAYMENT&search=ORD",
      ),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(ordersMocks.listMyOrders).toHaveBeenCalledWith(user.id, {
      page: 2,
      pageSize: 5,
      status: "PENDING_PAYMENT",
      search: "ORD",
    });
    expect(payload.meta.pagination).toMatchObject({
      page: 2,
      pageSize: 5,
      totalItems: 1,
      totalPages: 1,
    });
  });

  it("forwards the idempotency header when placing an order", async () => {
    const user = {
      id: "cmfcommerceuser00000000003",
      role: "CUSTOMER" as const,
      email: "place-order@example.com",
      name: "Place Order User",
      phone: null,
    };
    const order = {
      id: "cmforder000000000000000001",
      orderNumber: "ORD-TEST-001",
    };

    authMocks.requireUser.mockResolvedValue(user);
    ordersMocks.placeOrder.mockResolvedValue(order);

    const response = await placeOrderPost(
      new NextRequest("http://localhost/api/orders", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "idempotency-key": "idem-123",
        },
        body: JSON.stringify({
          shippingMethod: "INTERNAL_FLAT",
          paymentMethod: "MANUAL_TRANSFER",
          voucherCodes: ["PROMO10"],
          shippingAddress: {
            recipientName: "Test User",
            phone: "+628123456789",
            addressLine1: "Jl. Testing No. 1",
          },
        }),
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toMatchObject({
      success: true,
      data: order,
    });
    expect(ordersMocks.placeOrder).toHaveBeenCalledWith(
      user.id,
      expect.objectContaining({
        shippingMethod: "INTERNAL_FLAT",
        paymentMethod: "MANUAL_TRANSFER",
        voucherCodes: ["PROMO10"],
      }),
      "idem-123",
    );
  });
});
