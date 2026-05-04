import type { Metadata } from "next";

import type { DomainDocPageContent } from "./shared";

export const settingsMetadata: Metadata = {
  title: "Store Configuration | E-Commerce Engine Docs",
  description:
    "Runtime store settings organized by section with typed accessors and defaults.",
};

export const settingsPageContent: DomainDocPageContent = {
  eyebrow: "Commerce Domains",
  title: "Store Configuration",
  description:
    "Runtime store settings organized by section with typed accessors and defaults.",
  status: "stable",
  currentHref: "/docs/domains/settings",
  sections: [
    {
      id: "overview",
      title: "Overview",
      blocks: [
        {
          type: "paragraphs",
          items: [
            <>
              Store configuration is managed via the <code>StoreConfig</code>{" "}
              model, which stores key-value pairs controlling runtime behavior
              across the application. Settings are grouped into General,
              Checkout, Shipping, and Payment sections. Values are stored as
              strings and cast to text, number, or boolean through typed
              accessor functions at read time.
            </>,
          ],
        },
      ],
    },
    {
      id: "configuration-keys",
      title: "Configuration Keys",
      blocks: [
        {
          type: "paragraphs",
          items: ["The following configuration keys are available:"],
        },
        {
          type: "bullets",
          items: [
            <>
              <strong>STORE_NAME</strong> - Store display name for the
              storefront and order communications.
            </>,
            <>
              <strong>CURRENCY</strong> - Currency code used for pricing and
              formatting.
            </>,
            <>
              <strong>TIMEZONE</strong> - Store timezone for date display and
              scheduling.
            </>,
            <>
              <strong>MAX_VOUCHERS_PER_ORDER</strong> - Maximum number of
              voucher codes that can be applied to one order.
            </>,
            <>
              <strong>ALLOW_VOUCHER_STACKING</strong> - Whether multiple voucher
              codes can be combined.
            </>,
            <>
              <strong>ALLOW_VOUCHER_WITH_PRODUCT_DISCOUNT</strong> - Whether
              vouchers can be layered on top of product-level promotions.
            </>,
            <>
              <strong>FREE_SHIPPING_THRESHOLD</strong> - Minimum subtotal for
              free shipping.
            </>,
            <>
              <strong>INTERNAL_FLAT_SHIPPING_COST</strong> - Flat shipping fee
              when the order does not qualify for free shipping.
            </>,
            <>
              <strong>INTERNAL_FLAT_SHIPPING_ETA_DAYS</strong> - Estimated
              delivery time for the internal shipping method.
            </>,
            <>
              <strong>PAYMENT_TRANSFER_INSTRUCTIONS</strong> - Manual transfer
              instructions shown after order placement.
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
          items: ["The store configuration service provides the following functions:"],
        },
        {
          type: "bullets",
          items: [
            <>
              <strong>getAdminStoreConfig</strong> - Retrieves configuration
              key-value pairs organized by section for the admin settings UI.
            </>,
            <>
              <strong>updateAdminStoreConfig</strong> - Updates a single key
              with validation and audit logging.
            </>,
            <>
              <strong>bulkUpdateStoreConfig</strong> - Updates multiple keys in
              one transaction for section-level saves.
            </>,
            <>
              <strong>initializeStoreConfig</strong> - Seeds all configuration
              keys with default values during initial setup.
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
              path: "/api/admin/settings",
              summary: "Retrieve all store configuration values organized by section",
              access: "Admin",
            },
            {
              method: "PATCH",
              path: "/api/admin/settings",
              summary: "Update one or more store configuration values with validation",
              access: "Admin",
            },
            {
              method: "POST",
              path: "/api/admin/settings/initialize",
              summary: "Initialize store configuration with default values for all keys",
              access: "Admin",
            },
          ],
        },
      ],
    },
  ],
};
