import { NextRequest, NextResponse } from "next/server";

import {
  AdjustStockSchema,
  successResponse,
} from "@/shared/contracts";
import { requireAdminUser } from "@/server/auth";
import { adjustStock } from "@/server/inventory";
import { toErrorResponse } from "@/server/http";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdminUser(request);
    const payload = AdjustStockSchema.parse(await request.json());
    const result = await adjustStock(payload, admin.id);

    return NextResponse.json(successResponse(result));
  } catch (error) {
    return toErrorResponse(error);
  }
}
