import { NextRequest, NextResponse } from "next/server";

import {
  ProductListQuerySchema,
  successResponse,
} from "@/shared/contracts";
import { listProducts } from "@/server/catalog";
import { toErrorResponse } from "@/server/http";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const query = ProductListQuerySchema.parse(
      Object.fromEntries(request.nextUrl.searchParams.entries()),
    );
    const result = await listProducts(query);

    return NextResponse.json(
      successResponse(result.products, {
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
