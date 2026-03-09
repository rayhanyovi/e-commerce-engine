import { NextRequest, NextResponse } from "next/server";

import { ReviewPaymentSchema, successResponse } from "@/shared/contracts";
import { requireAdminUser } from "@/server/auth";
import { toErrorResponse } from "@/server/http";
import { reviewPayment } from "@/server/payments";

export const runtime = "nodejs";

export async function POST(
  request: NextRequest,
  context: {
    params: Promise<{ paymentId: string }>;
  },
) {
  try {
    const admin = await requireAdminUser(request);
    const payload = ReviewPaymentSchema.parse(await request.json());
    const { paymentId } = await context.params;
    const payment = await reviewPayment(paymentId, payload, admin.id);

    return NextResponse.json(successResponse(payment));
  } catch (error) {
    return toErrorResponse(error);
  }
}
