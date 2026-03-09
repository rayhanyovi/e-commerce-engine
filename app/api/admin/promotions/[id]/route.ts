import { NextRequest, NextResponse } from "next/server";

import {
  EntityIdRouteParamsSchema,
  UpdatePromotionSchema,
  successResponse,
} from "@/shared/contracts";
import { requireAdminUser } from "@/server/auth";
import { toErrorResponse } from "@/server/http";
import { deletePromotion, updatePromotion } from "@/server/promotions";

export const runtime = "nodejs";

export async function PATCH(
  request: NextRequest,
  context: {
    params: Promise<{ id: string }>;
  },
) {
  try {
    const admin = await requireAdminUser(request);
    const payload = UpdatePromotionSchema.parse(await request.json());
    const { id } = EntityIdRouteParamsSchema.parse(await context.params);
    const promotion = await updatePromotion(id, payload, admin.id);

    return NextResponse.json(successResponse(promotion));
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function DELETE(
  request: NextRequest,
  context: {
    params: Promise<{ id: string }>;
  },
) {
  try {
    const admin = await requireAdminUser(request);
    const { id } = EntityIdRouteParamsSchema.parse(await context.params);
    const result = await deletePromotion(id, admin.id);

    return NextResponse.json(successResponse(result));
  } catch (error) {
    return toErrorResponse(error);
  }
}
