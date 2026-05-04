import type { Metadata } from "next";

import type { DomainDocPageContent } from "./shared";

export const catalogMetadata: Metadata = {
  title: "Catalog & Products | E-Commerce Engine Docs",
  description:
    "Products, categories, variants, option definitions, and pricing logic.",
};

export const catalogPageContent: DomainDocPageContent = {
  eyebrow: "Commerce Domains",
  title: "Catalog & Products",
  description:
    "Products, categories, variants, option definitions, and pricing logic.",
  status: "stable",
  currentHref: "/docs/domains/catalog",
  sections: [
    {
      id: "overview",
      title: "Overview",
      blocks: [
        {
          type: "paragraphs",
          items: [
            <>
              Products are the core entity of the catalog domain. Each product
              has a base price, an optional promotional price, media URLs for
              imagery, and belongs to one or more categories. Products support
              option definitions such as <code>Size</code> or <code>Color</code>
              , plus variants that combine those options with optional price
              overrides and independent stock tracking per variant.
            </>,
          ],
        },
      ],
    },
    {
      id: "data-model",
      title: "Data Model",
      blocks: [
        {
          type: "paragraphs",
          items: ["The catalog domain is built around the following key models:"],
        },
        {
          type: "bullets",
          items: [
            <>
              <strong>Product</strong> - Core fields: <code>name</code>,{" "}
              <code>slug</code>, <code>basePrice</code>, <code>promoPrice</code>
              , <code>isActive</code>, <code>mediaUrls</code>. Represents a
              sellable item in the store.
            </>,
            <>
              <strong>ProductVariant</strong> - Fields: <code>sku</code>,{" "}
              <code>priceOverride</code>, <code>stockOnHand</code>. Each variant
              represents a specific purchasable combination of options with its
              own stock level.
            </>,
            <>
              <strong>Category</strong> - Fields: <code>name</code>,{" "}
              <code>slug</code>, <code>isActive</code>. Used to organize
              products into browsable groups.
            </>,
            <>
              <strong>ProductOptionDefinition</strong> - Defines an option type
              for a product such as <code>Size</code> or <code>Color</code>.
            </>,
            <>
              <strong>ProductOptionValue</strong> - A specific value within an
              option definition such as <code>Large</code> or <code>Red</code>.
            </>,
            <>
              <strong>VariantOptionCombination</strong> - Links a variant to
              its selected option values, defining the specific combination that
              variant represents.
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
          items: [
            <>
              The catalog service lives at{" "}
              <code>src/server/catalog/service.ts</code> and exposes the
              following functions:
            </>,
          ],
        },
        {
          type: "bullets",
          items: [
            <>
              <strong>Storefront reads:</strong> <code>listProducts</code>,{" "}
              <code>getPublicProductBySlug</code> for public product browsing
              and detail pages.
            </>,
            <>
              <strong>Admin reads:</strong> <code>listAdminProducts</code>,{" "}
              <code>getAdminProductById</code> for richer internal product
              detail including inactive inventory.
            </>,
            <>
              <strong>Mutations:</strong> <code>createProduct</code>,{" "}
              <code>updateProduct</code>, <code>deleteProduct</code> for
              admin-only catalog management.
            </>,
            <>
              <strong>Category operations:</strong>{" "}
              <code>listPublicCategories</code>, <code>createCategory</code>,{" "}
              <code>updateCategory</code>, <code>deleteCategory</code> for full
              category CRUD.
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
              path: "/api/categories",
              summary: "List all active categories",
              access: "Public",
            },
            {
              method: "GET",
              path: "/api/products",
              summary: "List active products with pagination and filtering",
              access: "Public",
            },
            {
              method: "GET",
              path: "/api/products/[slug]",
              summary: "Get full product details by slug including variants and options",
              access: "Public",
            },
            {
              method: "GET",
              path: "/api/admin/categories",
              summary: "List all categories including inactive ones",
              access: "Admin",
            },
            {
              method: "POST",
              path: "/api/admin/categories",
              summary: "Create a new category",
              access: "Admin",
            },
            {
              method: "GET",
              path: "/api/admin/products",
              summary: "List all products with admin-level detail and filtering",
              access: "Admin",
            },
            {
              method: "POST",
              path: "/api/admin/products",
              summary: "Create a new product with variants and option definitions",
              access: "Admin",
            },
          ],
        },
      ],
    },
    {
      id: "domain-helpers",
      title: "Domain Helpers",
      blocks: [
        {
          type: "paragraphs",
          items: [
            <>
              The <code>getEffectivePrice</code> helper determines the actual
              selling price for a product. It returns <code>promoPrice</code> if
              it is set and lower than <code>basePrice</code>; otherwise it
              returns <code>basePrice</code>. The same helper is used across the
              storefront, cart, and checkout to keep pricing consistent.
            </>,
          ],
        },
        {
          type: "codeBlocks",
          items: [
            {
              title: "Using getEffectivePrice",
              language: "typescript",
              code: `import { getEffectivePrice } from "@/server/domain/entities/product";

const price = getEffectivePrice({
  basePrice: 150000,
  promoPrice: 120000,
});
// -> 120000`,
            },
          ],
        },
      ],
    },
  ],
};
