import type { Metadata } from "next";

import type { DomainDocPageContent } from "./shared";

export const ordersMetadata: Metadata = {
  title: "Orders | E-Commerce Engine Docs",
  description:
    "Full order lifecycle with status state machine, stock reservations, and idempotency.",
};

export const ordersPageContent: DomainDocPageContent = {
  eyebrow: "Commerce Domains",
  title: "Orders",
  description:
    "Full order lifecycle with status state machine, stock reservations, and idempotency.",
  status: "stable",
  currentHref: "/docs/domains/orders",
  sections: [
    {
      id: "overview",
      title: "Overview",
      blocks: [
        {
          type: "paragraphs",
          items: [
            <>
              Orders are created from the cart checkout flow.{" "}
              <code>placeOrder</code> orchestrates a multi-step transaction:
              creating the order with snapshot data, generating order items,
              initializing payment records, reserving stock, recording promotion
              usage, and writing an audit log entry. The function also supports
              idempotency keys so retried submissions do not create duplicate
              orders.
            </>,
          ],
        },
      ],
    },
    {
      id: "order-placement",
      title: "Order Placement",
      blocks: [
        {
          type: "paragraphs",
          items: ["The order placement transaction creates the following records atomically:"],
        },
        {
          type: "bullets",
          items: [
            <>
              <strong>Order</strong> - Created with snapshots of customer
              information, shipping address, and computed prices including
              subtotal, discounts, shipping, and grand total.
            </>,
            <>
              <strong>OrderItems</strong> - One per cart line item, each
              capturing the unit price snapshot at purchase time.
            </>,
            <>
              <strong>Payment</strong> - Initialized with <code>PENDING</code>{" "}
              status and linked to the order.
            </>,
            <>
              <strong>StockReservations</strong> - Created with{" "}
              <code>ACTIVE</code> status for each ordered variant, reducing
              available stock.
            </>,
            <>
              <strong>PromotionUsage</strong> - Records which promotions and
              vouchers were used and increments usage counters.
            </>,
            <>
              <strong>AuditLog</strong> - Records the order creation event with
              actor and context details.
            </>,
          ],
        },
        {
          type: "paragraphs",
          items: [
            <>
              On success, the cart status transitions to <code>CONVERTED</code>,
              preventing further modification of the checked-out cart.
            </>,
          ],
        },
      ],
    },
    {
      id: "status-state-machine",
      title: "Status State Machine",
      blocks: [
        {
          type: "flow",
          title: "Order Status State Machine",
          diagram: `PENDING_PAYMENT -> PAYMENT_REVIEW -> PAID -> PROCESSING -> SHIPPED -> COMPLETED
       |                    |            |            |
       +-> CANCELLED <------+------------+------------+`,
        },
      ],
    },
    {
      id: "status-transitions",
      title: "Status Transitions",
      blocks: [
        {
          type: "paragraphs",
          items: [
            <>
              The <code>ORDER_STATUS_TRANSITIONS</code> map defines the valid
              next statuses for each order state:
            </>,
          ],
        },
        {
          type: "bullets",
          items: [
            <>
              <strong>PENDING_PAYMENT</strong> {"->"} PAYMENT_REVIEW, CANCELLED
            </>,
            <>
              <strong>PAYMENT_REVIEW</strong> {"->"} PAID, PENDING_PAYMENT,
              CANCELLED
            </>,
            <>
              <strong>PAID</strong> {"->"} PROCESSING, CANCELLED
            </>,
            <>
              <strong>PROCESSING</strong> {"->"} SHIPPED, CANCELLED
            </>,
            <>
              <strong>SHIPPED</strong> {"->"} COMPLETED
            </>,
            <>
              <strong>COMPLETED</strong> {"->"} terminal
            </>,
            <>
              <strong>CANCELLED</strong> {"->"} terminal
            </>,
          ],
        },
        {
          type: "paragraphs",
          items: [
            "Invalid transitions are rejected with a descriptive error. Cancellation from paid or processing states triggers stock reservation release.",
          ],
        },
      ],
    },
    {
      id: "snapshot-fields",
      title: "Snapshot Fields",
      blocks: [
        {
          type: "paragraphs",
          items: [
            "Orders capture point-in-time snapshots so historical records remain accurate even if upstream data changes later:",
          ],
        },
        {
          type: "bullets",
          items: [
            <>
              <strong>customerSnapshot</strong> - Captures the customer's name
              and email at order time.
            </>,
            <>
              <strong>addressSnapshot</strong> - Preserves the shipping address
              exactly as it was when the order was placed.
            </>,
            <>
              <strong>unitPriceSnapshot</strong> - The effective unit price
              charged for each item.
            </>,
            <>
              <strong>lineDiscountSnapshot</strong> - Any line-level discount
              applied to the item.
            </>,
            <>
              <strong>lineSubtotalSnapshot</strong> - The computed subtotal for
              each line item after discounts.
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
          items: ["The order service provides the following functions:"],
        },
        {
          type: "bullets",
          items: [
            <>
              <strong>Customer operations:</strong> <code>placeOrder</code>,{" "}
              <code>listMyOrders</code>, <code>getMyOrderById</code> for order
              placement and customer-scoped retrieval.
            </>,
            <>
              <strong>Admin operations:</strong> <code>listAdminOrders</code>,{" "}
              <code>getAdminOrderById</code>, <code>updateOrderStatus</code> for
              fulfillment and status transition control.
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
              path: "/api/orders",
              summary: "List the authenticated customer's orders with pagination",
              access: "Customer",
            },
            {
              method: "POST",
              path: "/api/orders",
              summary: "Place a new order from the active cart with idempotency support",
              access: "Customer",
            },
            {
              method: "GET",
              path: "/api/orders/[orderId]",
              summary: "Get full order details including items, payment, and status history",
              access: "Customer",
            },
            {
              method: "GET",
              path: "/api/admin/orders",
              summary: "List all orders with filtering by status, date range, and customer",
              access: "Admin",
            },
            {
              method: "GET",
              path: "/api/admin/orders/[id]",
              summary: "Get complete admin view of an order with all related records",
              access: "Admin",
            },
            {
              method: "PATCH",
              path: "/api/admin/orders/[id]/status",
              summary: "Transition order status with validation against the state machine",
              access: "Admin",
            },
          ],
        },
      ],
    },
  ],
};
