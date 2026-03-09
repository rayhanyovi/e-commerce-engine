import { NextRequest, NextResponse } from "next/server";

import { LoginSchema, successResponse } from "@/shared/contracts";
import { applySessionCookie, createSessionToken, loginUser } from "@/server/auth";
import { claimGuestCart, clearGuestCartCookie, readGuestCartToken } from "@/server/cart";
import { toErrorResponse } from "@/server/http";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const payload = LoginSchema.parse(await request.json());
    const result = await loginUser(payload);
    const guestToken = readGuestCartToken(request);

    if (guestToken) {
      await claimGuestCart(result.user.id, guestToken);
    }

    const sessionToken = await createSessionToken(result.session);
    const response = NextResponse.json(successResponse({ user: result.user }));

    applySessionCookie(response, sessionToken);

    if (guestToken) {
      clearGuestCartCookie(response);
    }

    return response;
  } catch (error) {
    return toErrorResponse(error);
  }
}
