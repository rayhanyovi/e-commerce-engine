import { NextRequest, NextResponse } from "next/server";

import {
  PaymentReviewQueueQuerySchema,
  successResponse,
} from "@/shared/contracts";
import { requireAdminUser } from "@/server/auth";
import { toErrorResponse } from "@/server/http";
import { listAdminPaymentReviewQueue } from "@/server/payments";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await requireAdminUser(request);
    const query = PaymentReviewQueueQuerySchema.parse(
      Object.fromEntries(request.nextUrl.searchParams.entries()),
    );
    const result = await listAdminPaymentReviewQueue(query);

    return NextResponse.json(
      successResponse(result.payments, {
        page: query.page,
        pageSize: query.pageSize,
        totalItems: result.total,
        totalPages: Math.ceil(result.total / query.pageSize),
      }),
    );
  } catch (error) {
    return toErrorResponse(error);
  }
}
