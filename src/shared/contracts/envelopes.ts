export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

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
    error: {
      code,
      message,
      details,
    },
  };
}
