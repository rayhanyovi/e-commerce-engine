import { NextRequest, NextResponse } from "next/server";

import { successResponse } from "@/shared/contracts";
import { requireUser } from "@/server/auth";
import { toErrorResponse } from "@/server/http";
import { getPaymentInstructions } from "@/server/payments";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  context: {
    params: Promise<{ orderId: string }>;
  },
) {
  try {
    const user = await requireUser(request);
    const { orderId } = await context.params;
    const instructions = await getPaymentInstructions(orderId, user);

    return NextResponse.json(successResponse(instructions));
  } catch (error) {
    return toErrorResponse(error);
  }
}
