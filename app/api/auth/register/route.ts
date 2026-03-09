import { NextRequest, NextResponse } from "next/server";

import { RegisterSchema, successResponse } from "@/shared/contracts";
import { createSessionToken, registerUser, applySessionCookie } from "@/server/auth";
import { claimGuestCart, clearGuestCartCookie, readGuestCartToken } from "@/server/cart";
import { toErrorResponse } from "@/server/http";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const payload = RegisterSchema.parse(await request.json());
    const result = await registerUser(payload);
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
