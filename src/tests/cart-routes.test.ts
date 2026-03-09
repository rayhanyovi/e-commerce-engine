import { NextRequest, NextResponse } from "next/server";

const cartMocks = vi.hoisted(() => ({
  addCartItem: vi.fn(),
  applyCartSessionCookie: vi.fn((response: NextResponse) => response),
  clearActiveCart: vi.fn(),
  getOrCreateActiveCart: vi.fn(),
  removeCartItem: vi.fn(),
  requireCartIdentity: vi.fn((session: unknown) => session),
  resolveCartSession: vi.fn(),
  updateCartItem: vi.fn(),
}));

vi.mock("@/server/cart", () => cartMocks);

import { DELETE as deleteCart, GET as getCart } from "../../app/api/cart/route";
import { POST as addCartItemPost } from "../../app/api/cart/items/route";
import {
  DELETE as deleteCartItem,
  PATCH as patchCartItem,
} from "../../app/api/cart/items/[itemId]/route";

function createCartSnapshot() {
  return {
    id: "cmfcart000000000000000001",
    userId: null,
    guestToken: "guest-token-1",
    status: "ACTIVE" as const,
    createdAt: "2026-03-10T00:00:00.000Z",
    updatedAt: "2026-03-10T00:00:00.000Z",
    items: [
      {
        id: "cmfcartitem00000000000001",
        cartId: "cmfcart000000000000000001",
        productId: "cmfproduct000000000000001",
        productVariantId: "cmfvariant000000000000001",
        qty: 2,
        unitPrice: 120000,
        lineTotal: 240000,
        variantLabel: "Size: 42",
        product: {
          id: "cmfproduct000000000000001",
          name: "Canvas Sneaker",
          slug: "canvas-sneaker",
          description: "Lightweight everyday sneaker",
          basePrice: 120000,
          promoPrice: null,
          isActive: true,
          mediaUrls: [],
        },
        variant: {
          id: "cmfvariant000000000000001",
          sku: "SNK-42",
          priceOverride: null,
          stockOnHand: 12,
          isActive: true,
          optionCombination: [],
        },
        warnings: {
          inactiveProduct: false,
          inactiveVariant: false,
          insufficientStock: false,
          availableQty: 12,
        },
      },
    ],
    summary: {
      itemCount: 2,
      subtotal: 240000,
    },
  };
}

describe("cart route handlers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the active cart and refreshes the guest cart cookie", async () => {
    const session = {
      userId: null,
      guestToken: "guest-token-1",
    };
    const cart = createCartSnapshot();

    cartMocks.resolveCartSession.mockResolvedValue(session);
    cartMocks.getOrCreateActiveCart.mockResolvedValue(cart);

    const response = await getCart(new NextRequest("http://localhost/api/cart"));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toMatchObject({
      success: true,
      data: cart,
    });
    expect(cartMocks.resolveCartSession).toHaveBeenCalledWith(expect.any(NextRequest), {
      ensureGuestToken: true,
    });
    expect(cartMocks.getOrCreateActiveCart).toHaveBeenCalledWith(session);
    expect(cartMocks.applyCartSessionCookie).toHaveBeenCalledWith(
      expect.any(NextResponse),
      session,
    );
  });

  it("adds an item to the cart and applies the current cart session", async () => {
    const session = {
      userId: null,
      guestToken: "guest-token-1",
    };
    const cart = createCartSnapshot();

    cartMocks.resolveCartSession.mockResolvedValue(session);
    cartMocks.addCartItem.mockResolvedValue(cart);

    const response = await addCartItemPost(
      new NextRequest("http://localhost/api/cart/items", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          productId: "cmfproduct000000000000001",
          productVariantId: "cmfvariant000000000000001",
          qty: 2,
        }),
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toMatchObject({
      success: true,
      data: cart,
    });
    expect(cartMocks.addCartItem).toHaveBeenCalledWith(session, {
      productId: "cmfproduct000000000000001",
      productVariantId: "cmfvariant000000000000001",
      qty: 2,
    });
    expect(cartMocks.applyCartSessionCookie).toHaveBeenCalledWith(
      expect.any(NextResponse),
      session,
    );
  });

  it("returns a validation error envelope when add-to-cart payload is invalid", async () => {
    const response = await addCartItemPost(
      new NextRequest("http://localhost/api/cart/items", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          productId: "invalid-id",
          productVariantId: "invalid-id",
          qty: 0,
        }),
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.success).toBe(false);
    expect(payload.error.code).toBe("VALIDATION_ERROR");
  });

  it("updates an existing cart item by route param", async () => {
    const session = {
      userId: null,
      guestToken: "guest-token-1",
    };
    const cart = createCartSnapshot();

    cartMocks.resolveCartSession.mockResolvedValue(session);
    cartMocks.updateCartItem.mockResolvedValue(cart);

    const response = await patchCartItem(
      new NextRequest("http://localhost/api/cart/items/cmfcartitem00000000000001", {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          qty: 3,
        }),
      }),
      {
        params: Promise.resolve({
          itemId: "cmfcartitem00000000000001",
        }),
      },
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toMatchObject({
      success: true,
      data: cart,
    });
    expect(cartMocks.updateCartItem).toHaveBeenCalledWith(
      session,
      "cmfcartitem00000000000001",
      {
        qty: 3,
      },
    );
  });

  it("removes a cart item by route param", async () => {
    const session = {
      userId: null,
      guestToken: "guest-token-1",
    };
    const cart = {
      ...createCartSnapshot(),
      items: [],
      summary: {
        itemCount: 0,
        subtotal: 0,
      },
    };

    cartMocks.resolveCartSession.mockResolvedValue(session);
    cartMocks.removeCartItem.mockResolvedValue(cart);

    const response = await deleteCartItem(
      new NextRequest("http://localhost/api/cart/items/cmfcartitem00000000000001", {
        method: "DELETE",
      }),
      {
        params: Promise.resolve({
          itemId: "cmfcartitem00000000000001",
        }),
      },
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toMatchObject({
      success: true,
      data: cart,
    });
    expect(cartMocks.removeCartItem).toHaveBeenCalledWith(
      session,
      "cmfcartitem00000000000001",
    );
  });

  it("clears the active cart and refreshes the cart cookie", async () => {
    const session = {
      userId: null,
      guestToken: "guest-token-1",
    };
    const cart = {
      ...createCartSnapshot(),
      items: [],
      summary: {
        itemCount: 0,
        subtotal: 0,
      },
    };

    cartMocks.resolveCartSession.mockResolvedValue(session);
    cartMocks.clearActiveCart.mockResolvedValue(cart);

    const response = await deleteCart(new NextRequest("http://localhost/api/cart"));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toMatchObject({
      success: true,
      data: cart,
    });
    expect(cartMocks.resolveCartSession).toHaveBeenCalledWith(expect.any(NextRequest), {
      ensureGuestToken: true,
    });
    expect(cartMocks.clearActiveCart).toHaveBeenCalledWith(session);
    expect(cartMocks.applyCartSessionCookie).toHaveBeenCalledWith(
      expect.any(NextResponse),
      session,
    );
  });
});
