import { NextRequest, NextResponse } from "next/server";

import {
  CreatePromotionSchema,
  PromotionListQuerySchema,
  successResponse,
} from "@/shared/contracts";
import { requireAdminUser } from "@/server/auth";
import { toErrorResponse } from "@/server/http";
import { createPromotion, listAdminPromotions } from "@/server/promotions";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await requireAdminUser(request);
    const query = PromotionListQuerySchema.parse(
      Object.fromEntries(request.nextUrl.searchParams.entries()),
    );
    const result = await listAdminPromotions(query);

    return NextResponse.json(
      successResponse(result.promotions, {
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
    const admin = await requireAdminUser(request);
    const payload = CreatePromotionSchema.parse(await request.json());
    const promotion = await createPromotion(payload, admin.id);

    return NextResponse.json(successResponse(promotion));
  } catch (error) {
    return toErrorResponse(error);
  }
}
