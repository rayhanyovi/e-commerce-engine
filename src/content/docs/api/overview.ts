import type { Metadata } from "next";

import { apiDomains } from "../reference-data";

const quickReference = apiDomains.flatMap((domain) =>
  domain.endpoints.flatMap((endpoint) =>
    endpoint.methods.map((method) => ({
      method: method.method,
      path: endpoint.path,
      summary: endpoint.summary,
      access: method.access,
    })),
  ),
);

export const apiOverviewMetadata: Metadata = {
  title: "API Overview | E-Commerce Engine Docs",
  description:
    "Summary of the engine API surface, including access tiers, envelope conventions, and the full route list across public, customer, and admin endpoints.",
};

export const apiOverviewPageContent = {
  eyebrow: "API Reference",
  title: "API Overview",
  description:
    "36 API endpoints across 3 access tiers with consistent JSON envelopes.",
  overview: [
    "Every endpoint in the engine returns a consistent ApiEnvelope<T> shape, making client-side consumption predictable regardless of the resource being accessed.",
    "Three access tiers govern who can call each endpoint. Public endpoints require no authentication. Customer endpoints require an active session cookie from a logged-in user. Admin endpoints additionally require the caller to hold the admin role.",
  ],
  envelopeCode: `interface ApiEnvelope<T> {
  success: boolean;
  data: T | null;
  meta?: Record<string, unknown>;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}`,
  accessTiers: [
    {
      title: "Public",
      description:
        "Categories, products, vouchers, and auth. 6 endpoints accessible without any authentication.",
      href: "/docs/api/public",
      badge: "6 endpoints",
    },
    {
      title: "Customer",
      description:
        "Cart, checkout, orders, addresses, and profile. 18 routes requiring an authenticated customer session.",
      href: "/docs/api/customer",
      badge: "18 routes",
    },
    {
      title: "Admin",
      description:
        "Dashboard, catalog, inventory, orders, payments, promotions, settings, and audit. 16 routes requiring the admin role.",
      href: "/docs/api/admin",
      badge: "16 routes",
    },
  ],
  quickReferenceIntro:
    "The complete list of engine routes, organized by HTTP method and path. Use the tier-specific pages for request and response details.",
  quickReference,
} as const;
