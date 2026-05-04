import type { Metadata } from "next";

import type { DomainDocPageContent } from "./shared";

export const inventoryMetadata: Metadata = {
  title: "Inventory | E-Commerce Engine Docs",
  description:
    "Stock adjustments, reservation lifecycle, movement tracking, and low-stock alerts.",
};

export const inventoryPageContent: DomainDocPageContent = {
  eyebrow: "Commerce Domains",
  title: "Inventory",
  description:
    "Stock adjustments, reservation lifecycle, movement tracking, and low-stock alerts.",
  status: "stable",
  currentHref: "/docs/domains/inventory",
  sections: [
    {
      id: "overview",
      title: "Overview",
      blocks: [
        {
          type: "paragraphs",
          items: [
            <>
              Inventory is tracked at the <code>ProductVariant</code> level via{" "}
              <code>stockOnHand</code>. The engine supports manual stock
              adjustments with actor and reason tracking, plus automatic stock
              operations during order placement, completion, and cancellation.
              Every stock change is recorded as a movement for auditability.
            </>,
          ],
        },
      ],
    },
    {
      id: "stock-movement-types",
      title: "Stock Movement Types",
      blocks: [
        {
          type: "paragraphs",
          items: ["The system tracks six distinct stock movement types:"],
        },
        {
          type: "bullets",
          items: [
            <>
              <strong>ADJUSTMENT_IN</strong> - Manual stock increase by an admin
              such as receiving inventory from a supplier.
            </>,
            <>
              <strong>ADJUSTMENT_OUT</strong> - Manual stock decrease for
              damaged goods or reconciliation.
            </>,
            <>
              <strong>ORDER_RESERVE</strong> - Automatic stock reservation when
              an order is placed.
            </>,
            <>
              <strong>ORDER_CANCEL_RELEASE</strong> - Automatic stock release
              when an order is cancelled.
            </>,
            <>
              <strong>ORDER_CONSUME</strong> - Final stock consumption when an
              order is completed.
            </>,
            <>
              <strong>INITIAL_STOCK</strong> - Stock set during seeding or
              first-time product setup.
            </>,
          ],
        },
      ],
    },
    {
      id: "reservation-lifecycle",
      title: "Reservation Lifecycle",
      blocks: [
        {
          type: "flow",
          title: "Stock Reservation Lifecycle",
          diagram: `Order Placed -> ACTIVE Reservation
  -> Order Completed -> CONSUMED
  -> Order Cancelled -> RELEASED
  -> Expiration -> EXPIRED`,
        },
      ],
    },
    {
      id: "server-module",
      title: "Server Module",
      blocks: [
        {
          type: "paragraphs",
          items: ["The inventory service provides the following functions:"],
        },
        {
          type: "bullets",
          items: [
            <>
              <strong>adjustStock</strong> - Performs manual stock adjustments
              with actor identification and a reason for audit purposes.
            </>,
            <>
              <strong>listStockMovements</strong> - Retrieves movement history
              with filtering by variant, movement type, and date range.
            </>,
            <>
              <strong>listLowStockVariants</strong> - Returns variants whose{" "}
              <code>stockOnHand</code> falls below the configured threshold.
            </>,
            <>
              <strong>checkStockAvailability</strong> - Verifies whether enough
              stock exists for a variant and quantity before cart or checkout
              mutations proceed.
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
              method: "POST",
              path: "/api/admin/inventory/adjust",
              summary: "Perform a manual stock adjustment with actor and reason tracking",
              access: "Admin",
            },
            {
              method: "GET",
              path: "/api/admin/inventory/movements",
              summary: "List stock movement history with filtering by variant, type, and date",
              access: "Admin",
            },
            {
              method: "GET",
              path: "/api/admin/inventory/low-stock",
              summary: "List product variants with stock below the configured threshold",
              access: "Admin",
            },
          ],
        },
      ],
    },
  ],
};
