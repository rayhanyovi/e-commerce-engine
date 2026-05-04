import type { Metadata } from "next";

export const paymentAdaptersRoadmapMetadata: Metadata = {
  title: "Payment Adapters | E-Commerce Engine Docs",
  description: "Planned payment gateway integration for the e-commerce engine.",
  robots: { index: false },
};

export const paymentAdaptersRoadmapContent = {
  title: "Payment Adapters",
  description:
    "Payment gateway integration that extends beyond manual bank transfer. This will enable storefronts to accept payments through providers like Xendit, Midtrans, Stripe, and other payment processors with automatic confirmation and webhook-based status updates.",
  proposedArchitecture:
    "The payment adapter will define a provider interface with methods for charge creation, status polling, refund processing, and webhook verification. The existing MANUAL_TRANSFER method becomes one adapter alongside automated providers. Each storefront can configure which payment methods are available through store settings. The order and payment status machines will integrate with adapter callbacks to automatically transition states.",
} as const;
