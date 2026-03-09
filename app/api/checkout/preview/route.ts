import { NextRequest, NextResponse } from "next/server";

import { CheckoutPreviewSchema, successResponse } from "@/shared/contracts";
import { requireUser } from "@/server/auth";
import { applyCartSessionCookie, requireCartIdentity, resolveCartSession } from "@/server/cart";
import { getCheckoutPreview } from "@/server/checkout";
import {
  toErrorResponse,
} from "@/server/http";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const payload = CheckoutPreviewSchema.parse(await request.json());
    await requireUser(request);
    const session = await resolveCartSession(request);
    const preview = await getCheckoutPreview(requireCartIdentity(session), payload);
    const response = NextResponse.json(successResponse(preview));

    return applyCartSessionCookie(response, session);
  } catch (error) {
    return toErrorResponse(error);
  }
}
