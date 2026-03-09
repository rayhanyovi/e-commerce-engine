import { NextRequest, NextResponse } from "next/server";

import { successResponse } from "@/shared/contracts";
import {
  applyCartSessionCookie,
  clearActiveCart,
  getOrCreateActiveCart,
  requireCartIdentity,
  resolveCartSession,
} from "@/server/cart";
import { toErrorResponse } from "@/server/http";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const session = await resolveCartSession(request, {
      ensureGuestToken: true,
    });
    const cart = await getOrCreateActiveCart(requireCartIdentity(session));
    const response = NextResponse.json(successResponse(cart));

    return applyCartSessionCookie(response, session);
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await resolveCartSession(request, {
      ensureGuestToken: true,
    });
    const cart = await clearActiveCart(requireCartIdentity(session));
    const response = NextResponse.json(successResponse(cart));

    return applyCartSessionCookie(response, session);
  } catch (error) {
    return toErrorResponse(error);
  }
}
