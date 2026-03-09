import { NextRequest, NextResponse } from "next/server";

import {
  EntityIdRouteParamsSchema,
  UpdateOrderStatusSchema,
  successResponse,
} from "@/shared/contracts";
import { requireAdminUser } from "@/server/auth";
import { updateOrderStatus } from "@/server/orders";
import { toErrorResponse } from "@/server/http";

export const runtime = "nodejs";

export async function PATCH(
  request: NextRequest,
  context: {
    params: Promise<{ id: string }>;
  },
) {
  try {
    const admin = await requireAdminUser(request);
    const payload = UpdateOrderStatusSchema.parse(await request.json());
    const { id } = EntityIdRouteParamsSchema.parse(await context.params);
    const order = await updateOrderStatus(id, payload, admin.id);

    return NextResponse.json(successResponse(order));
  } catch (error) {
    return toErrorResponse(error);
  }
}
