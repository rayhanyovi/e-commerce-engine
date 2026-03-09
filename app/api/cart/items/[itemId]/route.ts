import { NextRequest, NextResponse } from "next/server";

import { UpdateCartItemSchema, successResponse } from "@/shared/contracts";
import {
  applyCartSessionCookie,
  removeCartItem,
  requireCartIdentity,
  resolveCartSession,
  updateCartItem,
} from "@/server/cart";
import { toErrorResponse } from "@/server/http";

export const runtime = "nodejs";

export async function PATCH(
  request: NextRequest,
  context: {
    params: Promise<{ itemId: string }>;
  },
) {
  try {
    const payload = UpdateCartItemSchema.parse(await request.json());
    const { itemId } = await context.params;
    const session = await resolveCartSession(request);
    const cart = await updateCartItem(requireCartIdentity(session), itemId, payload);
    const response = NextResponse.json(successResponse(cart));

    return applyCartSessionCookie(response, session);
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function DELETE(
  request: NextRequest,
  context: {
    params: Promise<{ itemId: string }>;
  },
) {
  try {
    const { itemId } = await context.params;
    const session = await resolveCartSession(request);
    const cart = await removeCartItem(requireCartIdentity(session), itemId);
    const response = NextResponse.json(successResponse(cart));

    return applyCartSessionCookie(response, session);
  } catch (error) {
    return toErrorResponse(error);
  }
}
