import { NextResponse } from "next/server";

import { RegisterSchema, successResponse } from "@/shared/contracts";
import { createSessionToken, registerUser, applySessionCookie } from "@/server/auth";
import { toErrorResponse } from "@/server/http";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const payload = RegisterSchema.parse(await request.json());
    const result = await registerUser(payload);
    const sessionToken = await createSessionToken(result.session);
    const response = NextResponse.json(successResponse({ user: result.user }));

    return applySessionCookie(response, sessionToken);
  } catch (error) {
    return toErrorResponse(error);
  }
}
