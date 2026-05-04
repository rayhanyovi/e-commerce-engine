import type { Metadata } from "next";

import type { DomainDocPageContent } from "./shared";

export const cartMetadata: Metadata = {
  title: "Cart | E-Commerce Engine Docs",
  description:
    "Guest and authenticated cart lifecycle with stock validation and session management.",
};

export const cartPageContent: DomainDocPageContent = {
  eyebrow: "Commerce Domains",
  title: "Cart",
  description:
    "Guest and authenticated cart lifecycle with stock validation and session management.",
  status: "stable",
  currentHref: "/docs/domains/cart",
  sections: [
    {
      id: "overview",
      title: "Overview",
      blocks: [
        {
          type: "paragraphs",
          items: [
            <>
              The cart domain supports both authenticated users and anonymous
              guests. Authenticated users are identified by their session, while
              guests are tracked via a <code>guestToken</code> cookie. Items are
              validated against product activity status and available stock on
              every add operation. When a guest user logs in or registers, their
              existing guest cart is merged into their authenticated cart via{" "}
              <code>claimGuestCart</code>, preserving items and quantities.
            </>,
          ],
        },
      ],
    },
    {
      id: "cart-identity",
      title: "Cart Identity",
      blocks: [
        {
          type: "paragraphs",
          items: [
            <>
              Cart identity is resolved from the incoming request context. A{" "}
              <code>CartIdentity</code> is either <code>{`{ userId }`}</code>{" "}
              for authenticated users or <code>{`{ guestToken }`}</code> for
              anonymous guests. The server checks for a valid session first and
              falls back to the guest token cookie when no session is present,
              which keeps cart behavior consistent across authentication states.
            </>,
          ],
        },
      ],
    },
    {
      id: "server-module",
      title: "Server Module",
      blocks: [
        {
          type: "paragraphs",
          items: ["The cart service exposes the following functions:"],
        },
        {
          type: "bullets",
          items: [
            <>
              <strong>getOrCreateActiveCart</strong> - Retrieves the current
              active cart or creates one on first access.
            </>,
            <>
              <strong>addCartItem</strong> - Adds a product variant to the cart
              after validating product activity and stock availability.
            </>,
            <>
              <strong>updateCartItem</strong> - Updates the quantity of an
              existing cart item with stock re-validation.
            </>,
            <>
              <strong>removeCartItem</strong> - Removes a specific item from the
              cart.
            </>,
            <>
              <strong>clearActiveCart</strong> - Removes all items from the
              active cart and resets it to an empty state.
            </>,
            <>
              <strong>claimGuestCart</strong> - Merges a guest cart into the
              authenticated user's cart during login or registration.
            </>,
          ],
        },
      ],
    },
    {
      id: "api-endpoints",
      title: "API Endpoints",
      blocks: [
        {
          type: "routes",
          endpoints: [
            {
              method: "GET",
              path: "/api/cart",
              summary: "Get the current active cart with all items and product details",
              access: "Customer",
            },
            {
              method: "DELETE",
              path: "/api/cart",
              summary: "Clear all items from the active cart",
              access: "Customer",
            },
            {
              method: "POST",
              path: "/api/cart/items",
              summary: "Add a product variant to the cart with quantity and stock validation",
              access: "Customer",
            },
            {
              method: "PATCH",
              path: "/api/cart/items/[itemId]",
              summary: "Update the quantity of an existing cart item with stock re-validation",
              access: "Customer",
            },
            {
              method: "DELETE",
              path: "/api/cart/items/[itemId]",
              summary: "Remove a specific item from the cart",
              access: "Customer",
            },
          ],
        },
      ],
    },
    {
      id: "client-hook",
      title: "Client Hook",
      blocks: [
        {
          type: "paragraphs",
          items: [
            <>
              The <code>useCart</code> hook provides a client-side interface for
              cart operations. It returns the current cart snapshot, a loading
              state indicator, and mutation functions such as <code>addItem</code>
              , <code>updateItem</code>, <code>removeItem</code>, and{" "}
              <code>clearCart</code>. The hook keeps UI state synchronized with
              server mutations and handles error recovery centrally.
            </>,
          ],
        },
      ],
    },
    {
      id: "stock-validation",
      title: "Stock Validation",
      blocks: [
        {
          type: "paragraphs",
          items: [
            <>
              On every add or update operation, the cart engine checks whether
              the product is active, whether the selected variant is active, and
              whether sufficient stock exists for the requested quantity. If any
              check fails, the mutation is rejected with a descriptive error.
              The engine can also attach cart item warnings when stock levels
              change after an item was added, giving the customer feedback
              before checkout.
            </>,
          ],
        },
      ],
    },
  ],
};
