import { NextRequest, NextResponse } from "next/server";

import {
  EntityIdRouteParamsSchema,
  UpdateCategorySchema,
  successResponse,
} from "@/shared/contracts";
import {
  deleteCategory,
  updateCategory,
} from "@/server/catalog";
import { requireAdminUser } from "@/server/auth";
import { toErrorResponse } from "@/server/http";

export const runtime = "nodejs";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdminUser(request);
    const { id } = EntityIdRouteParamsSchema.parse(await context.params);
    const payload = UpdateCategorySchema.parse(await request.json());
    const category = await updateCategory(id, payload);

    return NextResponse.json(successResponse(category));
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdminUser(request);
    const { id } = EntityIdRouteParamsSchema.parse(await context.params);
    const result = await deleteCategory(id);

    return NextResponse.json(successResponse(result));
  } catch (error) {
    return toErrorResponse(error);
  }
}
