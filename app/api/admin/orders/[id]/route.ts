import { NextRequest, NextResponse } from "next/server";

import { EntityIdRouteParamsSchema, successResponse } from "@/shared/contracts";
import { requireAdminUser } from "@/server/auth";
import { getAdminOrderById } from "@/server/orders";
import { toErrorResponse } from "@/server/http";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  context: {
    params: Promise<{ id: string }>;
  },
) {
  try {
    await requireAdminUser(request);
    const { id } = EntityIdRouteParamsSchema.parse(await context.params);
    const order = await getAdminOrderById(id);

    return NextResponse.json(successResponse(order));
  } catch (error) {
    return toErrorResponse(error);
  }
}
