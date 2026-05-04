import type { Metadata } from "next";

export const webhooksRoadmapMetadata: Metadata = {
  title: "Webhooks | E-Commerce Engine Docs",
  description:
    "Planned webhook event delivery system for the e-commerce engine.",
  robots: { index: false },
};

export const webhooksRoadmapContent = {
  title: "Webhooks",
  description:
    "An event delivery system that notifies external services when significant events occur in the engine - order status changes, payment confirmations, inventory alerts, and more. This enables integrations with fulfillment systems, accounting tools, and custom automation.",
  proposedArchitecture:
    "The webhook system will define event types (order.placed, payment.confirmed, inventory.low_stock, etc.) and allow registration of endpoint URLs through admin settings. Events will be delivered with signed payloads and automatic retry on failure. The audit log system already captures the events - webhooks will extend this with external delivery.",
} as const;
