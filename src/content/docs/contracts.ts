import type { Metadata } from "next";

import { contractGroups, envelopeExample } from "./reference-data";

export const contractsMetadata: Metadata = {
  title: "Contracts & DTOs | E-Commerce Engine Docs",
  description:
    "Shared Zod contracts define request bodies, query params, normalized records, response envelopes, and route params across the engine.",
};

export const contractsPageContent = {
  eyebrow: "Engine Internals",
  title: "Contracts & DTOs",
  description:
    "Shared contracts are the engine's source of truth for validation, typing, and API boundaries.",
  overview:
    "Contracts in `src/shared/contracts/` define the boundary between route handlers, server modules, and client helpers. They keep request bodies, query params, pagination, and normalized records in sync across the whole stack, which is what makes the engine genuinely reusable instead of just convention-driven.",
  tip:
    "New storefront code should import DTOs and record shapes from the shared contracts layer instead of redefining request and response types locally.",
  envelopeExample,
  envelopeInterfaces: `export interface ApiResponse<T> {
  success: true;
  data: T;
  meta?: {
    pagination?: PaginationMeta;
  };
  error: null;
}

export interface ApiErrorResponse {
  success: false;
  data: null;
  meta: null;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}`,
  groups: contractGroups,
} as const;
