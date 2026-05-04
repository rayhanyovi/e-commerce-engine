import type { Metadata } from "next";

import type { DomainDocPageContent } from "./shared";

export const promotionsMetadata: Metadata = {
  title: "Promotions | E-Commerce Engine Docs",
  description:
    "Multi-scope discount engine with voucher codes, usage limits, and stacking rules.",
};

export const promotionsPageContent: DomainDocPageContent = {
  eyebrow: "Commerce Domains",
  title: "Promotions",
  description:
    "Multi-scope discount engine with voucher codes, usage limits, and stacking rules.",
  status: "stable",
  currentHref: "/docs/domains/promotions",
  sections: [
    {
      id: "overview",
      title: "Overview",
      blocks: [
        {
          type: "paragraphs",
          items: [
            <>
              The promotions domain provides a flexible discount engine with
              four discount types: <code>PERCENTAGE</code>,{" "}
              <code>FIXED_AMOUNT</code>, <code>FREE_PRODUCT</code>, and{" "}
              <code>FREE_SHIPPING</code>. Each promotion can target{" "}
              <code>ALL_PRODUCTS</code>, a specific <code>CATEGORY</code>, one{" "}
              <code>PRODUCT</code>, or an individual <code>VARIANT</code>.
              Promotions can also be attached to voucher codes with configurable
              usage limits and stacking behavior.
            </>,
          ],
        },
      ],
    },
    {
      id: "discount-calculation",
      title: "Discount Calculation",
      blocks: [
        {
          type: "paragraphs",
          items: ["Each discount type follows a specific calculation formula:"],
        },
        {
          type: "bullets",
          items: [
            <>
              <strong>PERCENTAGE</strong> - Calculates{" "}
              <code>floor(subtotal * value / 100)</code> with an optional{" "}
              <code>maxDiscountCap</code>.
            </>,
            <>
              <strong>FIXED_AMOUNT</strong> - Applies{" "}
              <code>min(value, subtotal)</code> so the discount never exceeds
              the subtotal it targets.
            </>,
            <>
              <strong>FREE_PRODUCT</strong> - Applied during checkout by adding
              the target product at zero cost.
            </>,
            <>
              <strong>FREE_SHIPPING</strong> - Applied during shipping
              calculation by waiving the shipping fee entirely.
            </>,
          ],
        },
      ],
    },
    {
      id: "eligibility-checks",
      title: "Eligibility Checks",
      blocks: [
        {
          type: "paragraphs",
          items: [
            <>
              <code>isPromotionEligible</code> validates whether a promotion can
              apply in the current order context:
            </>,
          ],
        },
        {
          type: "bullets",
          items: [
            <>
              <strong>isActive</strong> - The promotion must be enabled.
            </>,
            <>
              <strong>Date range</strong> - The current timestamp must fall
              within <code>validFrom</code> and <code>validUntil</code> when
              those limits are set.
            </>,
            <>
              <strong>totalUsageLimit</strong> - Global redemption count must
              stay below the configured cap.
            </>,
            <>
              <strong>perUserUsageLimit</strong> - The current customer's
              personal redemption count must stay below the allowed limit.
            </>,
          ],
        },
      ],
    },
    {
      id: "stacking-rules",
      title: "Stacking Rules",
      blocks: [
        {
          type: "paragraphs",
          items: [
            "Voucher stacking behavior is controlled through store configuration settings:",
          ],
        },
        {
          type: "bullets",
          items: [
            <>
              <strong>ALLOW_VOUCHER_STACKING</strong> - Allows multiple voucher
              codes on one order.
            </>,
            <>
              <strong>MAX_VOUCHERS_PER_ORDER</strong> - Caps the number of
              voucher codes that can be combined when stacking is enabled.
            </>,
            <>
              <strong>ALLOW_VOUCHER_WITH_PRODUCT_DISCOUNT</strong> - Controls
              whether voucher discounts can be layered on top of existing
              product-level promotional pricing.
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
          items: ["The promotions service provides the following functions:"],
        },
        {
          type: "bullets",
          items: [
            <>
              <strong>createPromotion</strong> - Creates a promotion with
              discount type, scope, voucher code, and eligibility rules.
            </>,
            <>
              <strong>updatePromotion</strong> - Updates an existing promotion's
              configuration.
            </>,
            <>
              <strong>deletePromotion</strong> - Soft-deletes a promotion while
              preserving historical usage records.
            </>,
            <>
              <strong>listAdminPromotions</strong> - Lists promotions with
              filtering and pagination for admin management.
            </>,
            <>
              <strong>validateVoucherSelection</strong> - Validates a set of
              voucher codes against stacking rules and eligibility.
            </>,
            <>
              <strong>validateVoucherCodes</strong> - Checks individual voucher
              codes and returns detailed validity status.
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
              path: "/api/vouchers/validate",
              summary: "Validate one or more voucher codes and return eligibility status",
              access: "Public",
            },
            {
              method: "GET",
              path: "/api/admin/promotions",
              summary: "List all promotions with filtering by type, scope, and status",
              access: "Admin",
            },
            {
              method: "POST",
              path: "/api/admin/promotions",
              summary: "Create a new promotion with discount configuration and voucher code",
              access: "Admin",
            },
            {
              method: "PATCH",
              path: "/api/admin/promotions/[id]",
              summary: "Update an existing promotion's configuration and eligibility rules",
              access: "Admin",
            },
            {
              method: "DELETE",
              path: "/api/admin/promotions/[id]",
              summary: "Delete a promotion and prevent future use",
              access: "Admin",
            },
          ],
        },
      ],
    },
  ],
};
