import type { Metadata } from "next";

import type { DomainDocPageContent } from "./shared";

export const checkoutMetadata: Metadata = {
  title: "Checkout | E-Commerce Engine Docs",
  description:
    "Quote building, voucher validation pipeline, shipping calculation, and checkout preview.",
};

export const checkoutPageContent: DomainDocPageContent = {
  eyebrow: "Commerce Domains",
  title: "Checkout",
  description:
    "Quote building, voucher validation pipeline, shipping calculation, and checkout preview.",
  status: "stable",
  currentHref: "/docs/domains/checkout",
  sections: [
    {
      id: "overview",
      title: "Overview",
      blocks: [
        {
          type: "paragraphs",
          items: [
            <>
              The checkout domain uses a unified formula engine for both preview
              and final order placement, ensuring pricing consistency across the
              customer journey. <code>buildCheckoutQuote</code> is the central
              calculation unit, computing subtotal, product discounts, voucher
              discounts, shipping costs, and grand total from the cart's current
              state. The price shown in preview is therefore the same price used
              during order placement.
            </>,
          ],
        },
      ],
    },
    {
      id: "checkout-preview",
      title: "Checkout Preview",
      blocks: [
        {
          type: "paragraphs",
          items: [
            <>
              <code>getCheckoutPreview</code> returns a comprehensive breakdown
              of the pending order:
            </>,
          ],
        },
        {
          type: "bullets",
          items: [
            <>
              <strong>items</strong> - Line items with product details,
              quantities, and computed prices.
            </>,
            <>
              <strong>currency</strong> - The store's configured currency code.
            </>,
            <>
              <strong>subtotal</strong> - Sum of all line item prices before
              discounts.
            </>,
            <>
              <strong>productDiscountTotal</strong> - Total savings from
              promotional pricing on individual products.
            </>,
            <>
              <strong>voucherDiscountTotal</strong> - Total savings from applied
              voucher codes.
            </>,
            <>
              <strong>shippingCost</strong> - Calculated shipping fee based on
              store configuration.
            </>,
            <>
              <strong>grandTotal</strong> - Final amount due after all discounts
              and shipping.
            </>,
            <>
              <strong>appliedVouchers</strong> - Voucher codes that were
              successfully applied with discount amounts.
            </>,
            <>
              <strong>rejectedVouchers</strong> - Voucher codes that failed
              validation with reason codes.
            </>,
            <>
              <strong>shippingMethod</strong> and{" "}
              <strong>shippingEtaDays</strong> - The method used for calculation
              and its estimated delivery window.
            </>,
          ],
        },
      ],
    },
    {
      id: "voucher-pipeline",
      title: "Voucher Pipeline",
      blocks: [
        {
          type: "paragraphs",
          items: [
            "Voucher codes submitted during checkout go through a multi-step validation pipeline. Each voucher is checked for:",
          ],
        },
        {
          type: "bullets",
          items: [
            <>
              <strong>Existence</strong> - The voucher code must exist in the
              system.
            </>,
            <>
              <strong>Active status</strong> - The promotion backing the voucher
              must be active.
            </>,
            <>
              <strong>Date range</strong> - The current date must fall within
              the promotion's <code>validFrom</code> and <code>validUntil</code>{" "}
              window.
            </>,
            <>
              <strong>Usage limits</strong> - Both total usage and per-user
              usage limits are enforced.
            </>,
            <>
              <strong>Minimum purchase</strong> - The cart subtotal must meet
              any minimum purchase requirement.
            </>,
            <>
              <strong>Scope targeting</strong> - The voucher must apply to at
              least one item in the cart based on its target scope.
            </>,
          ],
        },
        {
          type: "paragraphs",
          items: [
            "Rejected vouchers are returned with descriptive reason codes so the customer understands why a code was not applied.",
          ],
        },
      ],
    },
    {
      id: "shipping-calculation",
      title: "Shipping Calculation",
      blocks: [
        {
          type: "paragraphs",
          items: [
            <>
              Shipping is calculated using an internal flat-rate model
              configured through store settings. The relevant keys are{" "}
              <code>INTERNAL_FLAT_SHIPPING_COST</code> for the base fee and{" "}
              <code>INTERNAL_FLAT_SHIPPING_ETA_DAYS</code> for the delivery
              estimate. When the cart subtotal exceeds the configured{" "}
              <code>FREE_SHIPPING_THRESHOLD</code>, shipping is waived and set
              to zero.
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
              path: "/api/checkout/preview",
              summary: "Build a checkout quote with pricing breakdown, voucher validation, and shipping calculation",
              access: "Customer",
            },
          ],
        },
      ],
    },
    {
      id: "checkout-flow",
      title: "Checkout Flow",
      blocks: [
        {
          type: "flow",
          title: "Checkout Flow",
          diagram: `Cart Items -> Validate Stock -> Calculate Subtotal
  -> Apply Product Discounts -> Apply Vouchers
  -> Calculate Shipping -> Compute Grand Total
  -> Return Preview (or Place Order)`,
        },
      ],
    },
  ],
};
