import type { Metadata } from "next";

export const emailRoadmapMetadata: Metadata = {
  title: "Email Notifications | E-Commerce Engine Docs",
  description:
    "Planned transactional email system for the e-commerce engine.",
  robots: { index: false },
};

export const emailRoadmapContent = {
  title: "Email Notifications",
  description:
    "Transactional email system for order confirmations, payment receipts, shipping updates, and account notifications. This will allow storefronts to keep customers informed at every step of their order journey.",
  proposedArchitecture:
    "The email system will define a notification service that listens to domain events (order placed, payment confirmed, order shipped) and dispatches templated emails through a configurable provider (Resend, SendGrid, AWS SES, or SMTP). Email templates will be customizable per storefront while sharing the same trigger logic. Store settings will control which notifications are enabled.",
} as const;
