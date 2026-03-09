import { NextResponse } from "next/server";

import { LoginSchema, successResponse } from "@/shared/contracts";
import { applySessionCookie, createSessionToken, loginUser } from "@/server/auth";
import { toErrorResponse } from "@/server/http";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const payload = LoginSchema.parse(await request.json());
    const result = await loginUser(payload);
    const sessionToken = await createSessionToken(result.session);
    const response = NextResponse.json(successResponse({ user: result.user }));

    return applySessionCookie(response, sessionToken);
  } catch (error) {
    return toErrorResponse(error);
  }
}
