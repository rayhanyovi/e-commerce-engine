import { randomUUID } from "node:crypto";

import { NextRequest, NextResponse } from "next/server";

import { ErrorCodes } from "@/shared/contracts";
import { getCurrentUser } from "@/server/auth";
import { AppError } from "@/server/http";

import { GUEST_CART_COOKIE_MAX_AGE, GUEST_CART_COOKIE_NAME } from "./constants";
import { claimGuestCart, type CartIdentity } from "./service";

export function readGuestCartToken(request: NextRequest): string | null {
  return request.cookies.get(GUEST_CART_COOKIE_NAME)?.value ?? null;
}

export function ensureGuestCartToken(request: NextRequest) {
  const existingToken = readGuestCartToken(request);

  if (existingToken) {
    return {
      token: existingToken,
      created: false,
    };
  }

  return {
    token: randomUUID(),
    created: true,
  };
}

export function applyGuestCartCookie(
  response: NextResponse,
  guestToken: string,
): NextResponse {
  response.cookies.set({
    name: GUEST_CART_COOKIE_NAME,
    value: guestToken,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: GUEST_CART_COOKIE_MAX_AGE,
  });

  return response;
}

export function clearGuestCartCookie(response: NextResponse): NextResponse {
  response.cookies.set({
    name: GUEST_CART_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0),
  });

  return response;
}

export interface ResolvedCartSession {
  identity: CartIdentity | null;
  cookieAction: "none" | "set" | "clear";
  guestToken: string | null;
}

export async function resolveCartSession(
  request: NextRequest,
  options: {
    ensureGuestToken?: boolean;
  } = {},
): Promise<ResolvedCartSession> {
  const user = await getCurrentUser(request);
  const guestToken = readGuestCartToken(request);

  if (user) {
    if (guestToken) {
      await claimGuestCart(user.id, guestToken);

      return {
        identity: {
          userId: user.id,
        },
        cookieAction: "clear",
        guestToken: null,
      };
    }

    return {
      identity: {
        userId: user.id,
      },
      cookieAction: "none",
      guestToken: null,
    };
  }

  if (guestToken) {
    return {
      identity: {
        guestToken,
      },
      cookieAction: "none",
      guestToken,
    };
  }

  if (!options.ensureGuestToken) {
    return {
      identity: null,
      cookieAction: "none",
      guestToken: null,
    };
  }

  const nextGuest = ensureGuestCartToken(request);

  return {
    identity: {
      guestToken: nextGuest.token,
    },
    cookieAction: "set",
    guestToken: nextGuest.token,
  };
}

export function requireCartIdentity(session: ResolvedCartSession): CartIdentity {
  if (!session.identity) {
    throw new AppError(
      400,
      ErrorCodes.VALIDATION_ERROR,
      "Cart identity is required for this request",
    );
  }

  return session.identity;
}

export function applyCartSessionCookie(
  response: NextResponse,
  session: ResolvedCartSession,
): NextResponse {
  if (session.cookieAction === "set" && session.guestToken) {
    return applyGuestCartCookie(response, session.guestToken);
  }

  if (session.cookieAction === "clear") {
    return clearGuestCartCookie(response);
  }

  return response;
}
