import { NextRequest, NextResponse } from "next/server";

import {
  CreateCategorySchema,
  successResponse,
} from "@/shared/contracts";
import {
  createCategory,
  listAdminCategories,
} from "@/server/catalog";
import { requireAdminUser } from "@/server/auth";
import { toErrorResponse } from "@/server/http";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await requireAdminUser(request);
    const categories = await listAdminCategories();

    return NextResponse.json(successResponse(categories));
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdminUser(request);
    const payload = CreateCategorySchema.parse(await request.json());
    const category = await createCategory(payload);

    return NextResponse.json(successResponse(category));
  } catch (error) {
    return toErrorResponse(error);
  }
}
