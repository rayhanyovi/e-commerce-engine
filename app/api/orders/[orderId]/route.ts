import { NextRequest, NextResponse } from "next/server";

import { OrderRouteParamsSchema, successResponse } from "@/shared/contracts";
import { requireUser } from "@/server/auth";
import { getMyOrderById } from "@/server/orders";
import { toErrorResponse } from "@/server/http";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  context: {
    params: Promise<{ orderId: string }>;
  },
) {
  try {
    const user = await requireUser(request);
    const { orderId } = OrderRouteParamsSchema.parse(await context.params);
    const order = await getMyOrderById(orderId, user.id);

    return NextResponse.json(successResponse(order));
  } catch (error) {
    return toErrorResponse(error);
  }
}
