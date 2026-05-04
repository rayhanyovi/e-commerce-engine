import type { Metadata } from "next";

import { domainHelpers } from "./reference-data";

export const domainHelpersMetadata: Metadata = {
  title: "Domain Helpers | E-Commerce Engine Docs",
  description:
    "Pure helper functions for pricing, status transitions, promotions, shipping, and stock availability.",
};

export const domainHelpersPageContent = {
  eyebrow: "Engine Internals",
  title: "Domain Helpers",
  description:
    "Small, pure helpers keep the engine's rules testable and reusable across services.",
  overview:
    "These helpers are the lowest-friction way to share business rules across modules. They avoid database access, stay easy to unit test, and encode logic that should not drift between cart, checkout, order, payment, and promotion flows.",
  helpers: domainHelpers,
} as const;
