import { NextResponse, type NextRequest } from "next/server";

import { AUTH_COOKIE_NAME } from "@/server/auth/constants";
import { verifySessionToken } from "@/server/auth/session";

const adminMatcher = /^\/admin(?:\/.*)?$/;

export async function proxy(request: NextRequest) {
  if (!adminMatcher.test(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname);

    return NextResponse.redirect(loginUrl);
  }

  if (session.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
