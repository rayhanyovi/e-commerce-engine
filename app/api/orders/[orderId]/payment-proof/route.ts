import { NextRequest, NextResponse } from "next/server";

import { UploadPaymentProofSchema, successResponse } from "@/shared/contracts";
import { requireUser } from "@/server/auth";
import { toErrorResponse } from "@/server/http";
import { uploadPaymentProof } from "@/server/payments";

export const runtime = "nodejs";

export async function POST(
  request: NextRequest,
  context: {
    params: Promise<{ orderId: string }>;
  },
) {
  try {
    const user = await requireUser(request);
    const payload = UploadPaymentProofSchema.parse(await request.json());
    const { orderId } = await context.params;
    const result = await uploadPaymentProof(orderId, payload, user);

    return NextResponse.json(successResponse(result));
  } catch (error) {
    return toErrorResponse(error);
  }
}
