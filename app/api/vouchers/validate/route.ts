import { NextRequest, NextResponse } from "next/server";

import { ValidateVoucherSchema, successResponse } from "@/shared/contracts";
import { toErrorResponse } from "@/server/http";
import { validateVoucherCodes } from "@/server/promotions";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const payload = ValidateVoucherSchema.parse(await request.json());
    const result = await validateVoucherCodes(payload);

    return NextResponse.json(successResponse(result));
  } catch (error) {
    return toErrorResponse(error);
  }
}
