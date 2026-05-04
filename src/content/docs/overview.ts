import type { Metadata } from "next";

export const overviewMetadata: Metadata = {
  title: "Overview | E-Commerce Engine Docs",
  description:
    "Build commerce once, re-theme forever. A fullstack Next.js commerce engine with 13 domains, 36 API endpoints, and 20+ data models.",
};

export const overviewPageContent = {
  eyebrow: "E-Commerce Engine",
  title: "Build commerce once. Re-theme forever.",
  description:
    "A fullstack Next.js commerce engine with stable business logic, shared contracts, and replaceable presentation layers. Build storefronts without rebuilding infrastructure.",
  stats: [
    { label: "API Endpoints", value: "36" },
    { label: "Commerce Domains", value: "13" },
    { label: "Data Models", value: "20+" },
    { label: "Zod Contracts", value: "15" },
    { label: "Server Modules", value: "23" },
    { label: "Client Helpers", value: "13" },
  ],
  intro: [
    "This project is not a single storefront. It is a reusable commerce core that you clone once and build storefronts on top of. The engine handles auth, catalog, cart, checkout, orders, payments, promotions, inventory, settings, and audit logging. You handle UI, branding, and copy.",
    "Shared Zod contracts define the data boundary between server and client. Server modules contain all business logic. Client helpers are thin fetch wrappers. Hooks exist only where real client state is needed. Every new storefront reuses the engine and changes only when there is a genuinely new business need.",
    "The architecture is server-first, same-origin, and built on Next.js App Router. There is no separate API server, no CORS, and no external state management library.",
  ],
  domainsIntro:
    "The engine is organized into 13 commerce domains, each with its own server module, contracts, API endpoints, and client helpers.",
  domains: [
    {
      title: "Catalog & Products",
      description: "Products, categories, variants, options, and pricing.",
      href: "/docs/domains/catalog",
      endpointCount: 7,
    },
    {
      title: "Cart",
      description: "Guest and authenticated cart lifecycle with stock validation.",
      href: "/docs/domains/cart",
      endpointCount: 4,
    },
    {
      title: "Checkout",
      description: "Quote building, voucher pipeline, and shipping calculation.",
      href: "/docs/domains/checkout",
      endpointCount: 1,
    },
    {
      title: "Orders",
      description: "Full order lifecycle with status state machine and idempotency.",
      href: "/docs/domains/orders",
      endpointCount: 5,
    },
    {
      title: "Payments",
      description: "Manual transfer proof uploads and admin review queue.",
      href: "/docs/domains/payments",
      endpointCount: 3,
    },
    {
      title: "Promotions",
      description: "Multi-scope discounts, voucher codes, and usage limits.",
      href: "/docs/domains/promotions",
      endpointCount: 3,
    },
    {
      title: "Inventory",
      description: "Stock adjustments, reservations, movements, and low-stock alerts.",
      href: "/docs/domains/inventory",
      endpointCount: 3,
    },
    {
      title: "Addresses",
      description: "Customer address management with default address handling.",
      href: "/docs/domains/addresses",
      endpointCount: 2,
    },
    {
      title: "Store Configuration",
      description: "Runtime store settings organized by section.",
      href: "/docs/domains/settings",
      endpointCount: 3,
    },
    {
      title: "Admin Dashboard",
      description: "Operational metrics, KPIs, and recent activity.",
      href: "/docs/domains/dashboard",
      endpointCount: 1,
    },
    {
      title: "Audit Logs",
      description: "Comprehensive audit trail with before/after snapshots.",
      href: "/docs/domains/audit",
      endpointCount: 1,
    },
  ],
  quickLinks: [
    {
      title: "Quickstart",
      description: "Get the engine running in 5 minutes.",
      href: "/docs/quickstart",
    },
    {
      title: "Architecture",
      description: "Five-layer engine structure.",
      href: "/docs/architecture",
    },
    {
      title: "API Reference",
      description: "36 endpoints across 3 access tiers.",
      href: "/docs/api",
    },
  ],
} as const;
