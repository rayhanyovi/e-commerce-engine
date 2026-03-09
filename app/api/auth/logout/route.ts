import { NextResponse } from "next/server";

import { successResponse } from "@/shared/contracts";
import { clearSessionCookie } from "@/server/auth";

export const runtime = "nodejs";

export async function POST() {
  const response = NextResponse.json(successResponse({ success: true }));

  return clearSessionCookie(response);
}
