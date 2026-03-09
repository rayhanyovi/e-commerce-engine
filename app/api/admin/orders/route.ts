import { NextRequest, NextResponse } from "next/server";

import {
  OrderListQuerySchema,
  successResponse,
} from "@/shared/contracts";
import { requireAdminUser } from "@/server/auth";
import { listAdminOrders } from "@/server/orders";
import { toErrorResponse } from "@/server/http";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await requireAdminUser(request);
    const query = OrderListQuerySchema.parse(
      Object.fromEntries(request.nextUrl.searchParams.entries()),
    );
    const result = await listAdminOrders(query);

    return NextResponse.json(
      successResponse(result.orders, {
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
