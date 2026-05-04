import type { Metadata } from "next";

import { ErrorCodes } from "@/shared/contracts/error-codes";

export const errorHandlingMetadata: Metadata = {
  title: "Error Handling | E-Commerce Engine Docs",
  description:
    "Shared error envelope helpers and error code registry used across route handlers, server modules, and UI surfaces.",
};

export const errorHandlingPageContent = {
  eyebrow: "Engine Internals",
  title: "Error Handling",
  description:
    "The engine uses one shared error envelope and one shared code registry so failures remain predictable across every route.",
  overview:
    "Route handlers return either a success envelope or an error envelope. That keeps clients from guessing whether a failed request will return raw strings, framework-specific payloads, or ad hoc exception shapes. The same pattern also makes admin and storefront surfaces easier to keep consistent.",
  envelopeCode: `export interface ApiErrorResponse {
  success: false;
  data: null;
  meta: null;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export function errorResponse(
  code: string,
  message: string,
  details?: Record<string, unknown>,
): ApiErrorResponse {
  return {
    success: false,
    data: null,
    meta: null,
    error: { code, message, details },
  };
}`,
  envelopeNotes:
    "Pagination metadata only appears on success responses. Error payloads stay small and stable: a machine-readable code, a human-readable message, and optional structured details for validation or debugging.",
  errorCodePath: "src/shared/contracts/error-codes.ts",
  errorCodes: Object.values(ErrorCodes),
  guidance: [
    "Use shared DTOs and route param schemas to fail fast at the contract boundary before business logic runs.",
    "Keep permission failures explicit with `UNAUTHORIZED` and `FORBIDDEN` rather than returning ambiguous 500s.",
    "Preserve domain-specific failures such as voucher, payment, stock, and order-transition errors by returning the shared registry values instead of string literals.",
    "Map backend errors to UI-safe messages in the client layer rather than leaking internal implementation detail into customer-facing surfaces.",
  ],
} as const;
