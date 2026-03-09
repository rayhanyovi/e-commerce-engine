import { NextRequest, NextResponse } from "next/server";

import {
  LowStockQuerySchema,
  successResponse,
} from "@/shared/contracts";
import { requireAdminUser } from "@/server/auth";
import { listLowStockVariants } from "@/server/inventory";
import { toErrorResponse } from "@/server/http";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await requireAdminUser(request);
    const query = LowStockQuerySchema.parse(
      Object.fromEntries(request.nextUrl.searchParams.entries()),
    );
    const result = await listLowStockVariants(query);

    return NextResponse.json(
      successResponse(result.variants, {
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
