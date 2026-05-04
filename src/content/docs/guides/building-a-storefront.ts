import type { Metadata } from "next";

export const buildingAStorefrontMetadata: Metadata = {
  title: "Building a Storefront | E-Commerce Engine Docs",
  description:
    "Step-by-step guide for creating a new storefront on the e-commerce engine.",
};

export const buildingAStorefrontPageContent = {
  eyebrow: "Guides",
  title: "Building a Storefront",
  description:
    "Create a new e-commerce storefront by consuming the engine's server modules, contracts, and client helpers.",
  approach: [
    "A new storefront is a presentation layer on top of the engine. You do not fork or rewrite business logic. Instead, you import server modules for data, use shared contracts for validation, and wire client helpers into your UI components.",
    "The engine handles auth, catalog, cart, checkout, orders, payments, promotions, inventory, settings, and audit. You handle visual identity, layout, marketing content, and any store-specific UI.",
  ],
  steps: [
    {
      title: "Clone the engine",
      description:
        "Start by cloning the engine repository. This gives you the full engine with all 13 commerce domains, contracts, and server modules ready to use.",
    },
    {
      title: "Configure the environment",
      description:
        "Copy .env.local.example to .env.local. Set DATABASE_URL to your PostgreSQL instance, generate a strong AUTH_SECRET, and set APP_URL to your deployment domain.",
    },
    {
      title: "Initialize the database",
      description:
        "Run Prisma migrations and seed the database with default store config and an admin account. This gives you a working engine with sample data.",
      code: {
        code: "npm run db:generate\nnpm run db:migrate\nnpm run db:seed",
        language: "bash",
      },
    },
    {
      title: "Customize your Tailwind theme",
      description:
        "Open app/globals.css and override the CSS custom properties. Change --accent, --background, --surface, and other tokens to match your brand. The entire design system flows from these variables.",
    },
    {
      title: "Build storefront pages",
      description:
        "Create your pages in app/(storefront)/. Import server modules for data fetching and client helpers for interactive flows. The engine handles business logic while you handle layout, copy, and media.",
    },
    {
      title: "Deploy",
      description:
        "Build with npm run build, set production environment variables, run database migrations, and deploy to your hosting platform. See the Deployment guide for details.",
    },
  ],
  consuming: [
    "In server components and route handlers, import directly from server modules. In client components, use the client helpers from src/lib/.",
  ],
  examples: [
    {
      title: "Server Component",
      language: "typescript",
      code: `// app/(storefront)/products/page.tsx
import { listProducts } from "@/server/catalog";

export default async function ProductsPage() {
  const products = await listProducts({ page: 1, pageSize: 20 });
  return <ProductGrid products={products.items} />;
}`,
    },
    {
      title: "Client Component",
      language: "typescript",
      code: `// Using client helpers for mutations
"use client";
import { addToCart } from "@/lib/cart/client";

function AddToCartButton({ productId, variantId }) {
  async function handleClick() {
    await addToCart({ productId, variantId, qty: 1 });
  }
  return <button onClick={handleClick}>Add to Cart</button>;
}`,
    },
  ],
  callout:
    "Keep your storefront UI in app/(storefront)/ and your custom components in src/components/storefront/. This keeps the engine boundary clean for future upgrades.",
} as const;
