import type { Metadata } from "next";

import { ErrorCodes } from "@/shared/contracts/error-codes";

export const apiDesignMetadata: Metadata = {
  title: "API Design | E-Commerce Engine Docs",
  description:
    "API conventions for the e-commerce engine covering the response envelope format, 16 typed error codes, pagination, and cookie-based authentication.",
};

export const apiDesignPageContent = {
  eyebrow: "Architecture",
  title: "API Design",
  description:
    "Every API endpoint follows the same envelope format, uses typed error codes, and authenticates via httpOnly session cookies. This page documents the conventions that keep the API consistent and predictable.",
  envelopeIntro:
    "All API responses use a consistent envelope defined by ApiResponse<T> for success and ApiErrorResponse for errors. The success boolean lets clients branch immediately without inspecting HTTP status codes. The meta field carries pagination data when applicable, and the error field provides a typed error code with a human-readable message and optional details.",
  successResponse: `{
  "success": true,
  "data": { ... },
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "totalItems": 42,
      "totalPages": 3
    }
  },
  "error": null
}`,
  errorResponse: `{
  "success": false,
  "data": null,
  "meta": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request body",
    "details": { ... }
  }
}`,
  errorCodesIntro:
    "The engine defines 16 typed error codes in src/shared/contracts/error-codes.ts. Each code maps to a specific failure scenario and is returned in the error.code field of error responses. Client code can switch on these codes to show contextual error messages.",
  errorCodes: [
    {
      code: ErrorCodes.VALIDATION_ERROR,
      meaning: "Request body or query params failed Zod validation",
    },
    {
      code: ErrorCodes.UNAUTHORIZED,
      meaning: "No valid session cookie present on the request",
    },
    {
      code: ErrorCodes.FORBIDDEN,
      meaning: "Authenticated user lacks the required role for this endpoint",
    },
    {
      code: ErrorCodes.INVALID_REQUEST_ORIGIN,
      meaning: "Request origin does not match the application origin (same-origin check failed)",
    },
    {
      code: ErrorCodes.NOT_FOUND,
      meaning: "The requested resource does not exist",
    },
    {
      code: ErrorCodes.INTERNAL_ERROR,
      meaning: "Unexpected server failure; details are logged but not exposed to the client",
    },
    {
      code: ErrorCodes.INSUFFICIENT_STOCK,
      meaning: "Not enough stock available to fulfill the requested quantity",
    },
    {
      code: ErrorCodes.INVALID_VOUCHER,
      meaning: "Voucher code is not recognized in the system",
    },
    {
      code: ErrorCodes.VOUCHER_NOT_APPLICABLE,
      meaning: "Voucher does not apply to the current cart items based on scope rules",
    },
    {
      code: ErrorCodes.VOUCHER_USAGE_EXCEEDED,
      meaning: "Total redemption limit or per-user usage limit has been reached",
    },
    {
      code: ErrorCodes.VOUCHER_EXPIRED,
      meaning: "Voucher is past its valid date range and can no longer be redeemed",
    },
    {
      code: ErrorCodes.VOUCHER_STACKING_NOT_ALLOWED,
      meaning: "Cannot combine this voucher with other vouchers already applied to the cart",
    },
    {
      code: ErrorCodes.CHECKOUT_IDEMPOTENCY_CONFLICT,
      meaning: "Duplicate order placement attempt detected via idempotency key",
    },
    {
      code: ErrorCodes.PAYMENT_PROOF_INVALID,
      meaning: "Payment proof file type, size, or path was rejected",
    },
    {
      code: ErrorCodes.PAYMENT_ALREADY_CONFIRMED,
      meaning: "Payment has already been confirmed and cannot be modified",
    },
    {
      code: ErrorCodes.ORDER_STATUS_TRANSITION_INVALID,
      meaning: "The requested status transition is not allowed from the current order status",
    },
  ],
  pagination: [
    "List endpoints accept page and pageSize query parameters validated by the PaginationQuery schema. The page parameter is 1-indexed and defaults to 1. The pageSize parameter defaults to 20 and is capped at 100 to prevent excessive database loads.",
    "Paginated responses include a meta.pagination object with four fields: page, pageSize, totalItems, and totalPages. Clients use totalPages to render pagination controls and disable next and previous buttons at boundaries.",
  ],
  authModel: [
    "The API uses cookie-based authentication with httpOnly session cookies. When a user logs in or registers, the server issues a signed JWT token and sets it as an httpOnly, secure, same-site cookie. The browser sends this cookie automatically with every subsequent request, eliminating the need for Authorization headers or client-side token storage.",
    "Every mutating endpoint performs a same-origin check by comparing the Origin header against the configured APP_URL. This prevents cross-site request forgery without requiring CSRF tokens, since third-party sites cannot forge the Origin header in modern browsers.",
    "Route handlers use server guards such as getCurrentUser, requireUser, and requireAdminUser to extract and verify the session. These guards either return the authenticated user or throw an HTTP error with the appropriate error code.",
  ],
} as const;
