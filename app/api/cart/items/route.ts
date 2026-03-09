import { NextRequest, NextResponse } from "next/server";

import { AddCartItemSchema, successResponse } from "@/shared/contracts";
import {
  addCartItem,
  applyCartSessionCookie,
  requireCartIdentity,
  resolveCartSession,
} from "@/server/cart";
import { toErrorResponse } from "@/server/http";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const payload = AddCartItemSchema.parse(await request.json());
    const session = await resolveCartSession(request, {
      ensureGuestToken: true,
    });
    const cart = await addCartItem(requireCartIdentity(session), payload);
    const response = NextResponse.json(successResponse(cart));

    return applyCartSessionCookie(response, session);
  } catch (error) {
    return toErrorResponse(error);
  }
}
