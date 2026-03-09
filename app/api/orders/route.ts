import { NextRequest, NextResponse } from "next/server";

import {
  OrderListQuerySchema,
  PlaceOrderSchema,
  successResponse,
} from "@/shared/contracts";
import { requireUser } from "@/server/auth";
import { listMyOrders, placeOrder } from "@/server/orders";
import { toErrorResponse } from "@/server/http";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const query = OrderListQuerySchema.parse(
      Object.fromEntries(request.nextUrl.searchParams.entries()),
    );
    const result = await listMyOrders(user.id, query);

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

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const payload = PlaceOrderSchema.parse(await request.json());
    const idempotencyKey = request.headers.get("idempotency-key") ?? undefined;
    const order = await placeOrder(user.id, payload, idempotencyKey);

    return NextResponse.json(successResponse(order));
  } catch (error) {
    return toErrorResponse(error);
  }
}
