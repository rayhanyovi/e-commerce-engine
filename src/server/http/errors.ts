import { NextResponse } from "next/server";
import { ZodError } from "zod";

import {
  ErrorCodes,
  errorResponse,
  type ApiErrorResponse,
  type ErrorCode,
} from "@/shared/contracts";

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: ErrorCode,
    message: string,
    public details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function toErrorResponse(error: unknown): NextResponse<ApiErrorResponse> {
  if (error instanceof ZodError) {
    return NextResponse.json(
      errorResponse(ErrorCodes.VALIDATION_ERROR, "Invalid request payload", {
        fieldErrors: error.flatten().fieldErrors,
        formErrors: error.flatten().formErrors,
      }),
      { status: 400 },
    );
  }

  if (error instanceof AppError) {
    return NextResponse.json(
      errorResponse(error.code, error.message, error.details),
      { status: error.statusCode },
    );
  }

  console.error(error);

  return NextResponse.json(
    errorResponse(ErrorCodes.INTERNAL_ERROR, "Internal server error"),
    { status: 500 },
  );
}
