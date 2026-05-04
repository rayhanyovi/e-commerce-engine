import type { Metadata } from "next";

const customerEndpoints = [
  { method: "POST", path: "/api/auth/logout", summary: "End current session", access: "Customer" },
  { method: "GET", path: "/api/me", summary: "Get current user profile", access: "Customer" },
  { method: "PATCH", path: "/api/me", summary: "Update user profile", access: "Customer" },
  { method: "GET", path: "/api/addresses", summary: "List saved addresses", access: "Customer" },
  { method: "POST", path: "/api/addresses", summary: "Add a new address", access: "Customer" },
  { method: "PATCH", path: "/api/addresses/[id]", summary: "Update an address", access: "Customer" },
  { method: "DELETE", path: "/api/addresses/[id]", summary: "Remove an address", access: "Customer" },
  { method: "GET", path: "/api/cart", summary: "Get active cart", access: "Customer" },
  { method: "DELETE", path: "/api/cart", summary: "Clear entire cart", access: "Customer" },
  { method: "POST", path: "/api/cart/items", summary: "Add item to cart", access: "Customer" },
  { method: "PATCH", path: "/api/cart/items/[itemId]", summary: "Update cart item quantity", access: "Customer" },
  { method: "DELETE", path: "/api/cart/items/[itemId]", summary: "Remove item from cart", access: "Customer" },
  { method: "POST", path: "/api/checkout/preview", summary: "Preview order totals", access: "Customer" },
  { method: "GET", path: "/api/orders", summary: "List customer orders", access: "Customer" },
  { method: "POST", path: "/api/orders", summary: "Place a new order", access: "Customer" },
  { method: "GET", path: "/api/orders/[orderId]", summary: "Get order details", access: "Customer" },
  { method: "GET", path: "/api/orders/[orderId]/payment-instructions", summary: "Get payment instructions", access: "Customer" },
  { method: "POST", path: "/api/orders/[orderId]/payment-proof", summary: "Upload payment proof", access: "Customer" },
] as const;

export const customerApisMetadata: Metadata = {
  title: "Customer APIs | E-Commerce Engine Docs",
  description:
    "Authenticated customer routes for profile, addresses, cart, checkout, orders, and payment submission.",
};

export const customerApisPageContent = {
  eyebrow: "API Reference",
  title: "Customer APIs",
  description: "Endpoints requiring an authenticated customer session.",
  overview:
    "All customer routes require an active session cookie set during login or registration. Requests without a valid session receive a 401 response with the UNAUTHORIZED error code. These endpoints cover session management, profile updates, address book, cart operations, checkout previews, order placement, and payment submission.",
  endpoints: customerEndpoints,
  sections: [
    {
      id: "session",
      title: "Session Management",
      paragraphs: [
        "POST /api/auth/logout clears the session cookie and ends the current session. No request body is needed. After logout, the client should redirect to the login page or home.",
        "GET /api/me returns the currently authenticated user's profile including their name, email, and role. This is the primary way to check authentication status on the client.",
        "PATCH /api/me updates the user's profile fields. The current flow focuses on mutable profile data rather than account identity changes.",
      ],
      codeBlocks: [
        {
          title: "PATCH /api/me request body",
          language: "typescript",
          code: `interface UpdateProfileDto {
  name: string;
}`,
        },
      ],
    },
    {
      id: "addresses",
      title: "Address Book",
      paragraphs: [
        "Customers can manage multiple shipping addresses. Each address includes a label, recipient name, full street address, city, postal code, and phone number. One address can be marked as the default for checkout pre-fill.",
        "GET /api/addresses returns all addresses for the current user, sorted by creation date.",
        "POST /api/addresses adds a new address. If this is the first address, it is automatically marked as the default.",
        "PATCH /api/addresses/[id] updates an existing address. Only addresses owned by the current user can be modified.",
        "DELETE /api/addresses/[id] removes an address. If the deleted address was the default, the server promotes a remaining address.",
      ],
      codeBlocks: [
        {
          title: "Address shape",
          language: "typescript",
          code: `interface AddressDto {
  label: string;
  recipientName: string;
  phone: string;
  streetAddress: string;
  city: string;
  province: string;
  postalCode: string;
  isDefault?: boolean;
}`,
        },
      ],
    },
    {
      id: "cart",
      title: "Cart Operations",
      paragraphs: [
        "The cart is server-managed and persists across sessions. Each customer has at most one active cart at a time.",
        "GET /api/cart returns the active cart snapshot including all items, computed line totals, and the cart subtotal. If no active cart exists, one is created automatically.",
        "DELETE /api/cart removes all items from the active cart, resetting it to empty.",
        "POST /api/cart/items adds a product variant to the cart. If the variant is already in the cart, its quantity is incremented. Stock availability is checked at add time.",
        "PATCH /api/cart/items/[itemId] updates the quantity of a specific cart item. Setting quantity to zero removes the item.",
        "DELETE /api/cart/items/[itemId] removes a specific item from the cart entirely.",
      ],
      codeBlocks: [
        {
          title: "Add to cart request",
          language: "typescript",
          code: `interface AddCartItemDto {
  variantId: string;
  quantity: number;
}`,
        },
        {
          title: "Cart snapshot response",
          language: "typescript",
          code: `interface CartSnapshot {
  id: string;
  items: {
    id: string;
    variantId: string;
    variantName: string;
    productName: string;
    productSlug: string;
    thumbnailUrl: string | null;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
  }[];
  subtotal: number;
  itemCount: number;
}`,
        },
      ],
    },
    {
      id: "checkout",
      title: "Checkout Preview",
      paragraphs: [
        "POST /api/checkout/preview computes a full order preview without placing the order. It evaluates the current cart, applies voucher codes, calculates shipping based on the selected address, and returns the final totals.",
      ],
      codeBlocks: [
        {
          title: "Checkout preview request",
          language: "typescript",
          code: `interface CheckoutPreviewDto {
  addressId: string;
  voucherCode?: string;
}`,
        },
        {
          title: "Checkout preview response",
          language: "typescript",
          code: `interface CheckoutQuote {
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  voucherApplied: boolean;
  voucherMessage?: string;
  items: { variantId: string; quantity: number; unitPrice: number; lineTotal: number }[];
}`,
        },
      ],
    },
    {
      id: "orders",
      title: "Orders",
      paragraphs: [
        "GET /api/orders lists all orders for the current customer, sorted by creation date descending. Each row includes order status, total, and item count.",
        "POST /api/orders places a new order using the current cart contents. It requires a shipping address and optionally voucher codes. Stock is reserved atomically, and the cart is cleared on success. An idempotency key prevents duplicate orders from retries or double-clicks.",
        "GET /api/orders/[orderId] returns full order details including line items, shipping address, payment status, and status history.",
      ],
      codeBlocks: [
        {
          title: "Place order request",
          language: "typescript",
          code: `interface PlaceOrderDto {
  addressId: string;
  voucherCode?: string;
  idempotencyKey: string;
}`,
        },
      ],
    },
    {
      id: "payments",
      title: "Payment Flow",
      paragraphs: [
        "GET /api/orders/[orderId]/payment-instructions returns the payment method details for a pending order, including the amount due. It is intended for orders that still require customer action.",
        "POST /api/orders/[orderId]/payment-proof submits a payment proof for manual verification. After upload, the order moves into review and becomes visible in the admin payment queue.",
      ],
      codeBlocks: [
        {
          title: "Payment proof upload",
          language: "typescript",
          code: `// multipart/form-data
{
  file: File;
}`,
        },
      ],
    },
  ],
} as const;
