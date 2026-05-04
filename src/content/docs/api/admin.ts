import type { Metadata } from "next";

import { apiDomains } from "../reference-data";

const adminDomain = apiDomains.find((domain) => domain.id === "admin-operations");

export const adminApisMetadata: Metadata = {
  title: "Admin APIs | E-Commerce Engine Docs",
  description:
    "Admin-only route handlers for dashboarding, catalog, orders, payments, promotions, inventory, settings, and audit logs.",
};

export const adminApisPageContent = {
  eyebrow: "API Reference",
  title: "Admin APIs",
  description:
    "Admin-only route handlers for operational reporting, catalog maintenance, fulfillment, payment review, inventory, runtime settings, and audit trails.",
  overview: [
    "These routes are guarded by admin-only session checks and power the engine's back office. The same domain services used by the admin UI are exposed here through App Router route handlers, which keeps business rules centralized in src/server/ and makes the admin surfaces thin orchestration layers.",
    "Mutating endpoints continue to rely on the same same-origin cookie model as customer routes. Validation stays contract-driven, and every response is wrapped in the shared API envelope documented in the API design section.",
  ],
  domain: adminDomain,
} as const;
