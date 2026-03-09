import { z } from "zod";

export const PaginationMetaSchema = z.object({
  page: z.number().int().min(1),
  pageSize: z.number().int().min(1).max(100),
  totalItems: z.number().int().min(0),
  totalPages: z.number().int().min(0),
});

export type PaginationMeta = z.infer<typeof PaginationMetaSchema>;

export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;

export interface ApiResponse<T> {
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
}

export type ApiEnvelope<T> = ApiResponse<T> | ApiErrorResponse;

export function successResponse<T>(data: T, pagination?: PaginationMeta): ApiResponse<T> {
  return {
    success: true,
    data,
    meta: pagination ? { pagination } : undefined,
    error: null,
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
}
