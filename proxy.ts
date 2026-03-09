import { NextResponse, type NextRequest } from "next/server";

import { ErrorCodes, errorResponse } from "@/shared/contracts";
import { AUTH_COOKIE_NAME } from "@/server/auth/constants";
import { verifySessionToken } from "@/server/auth/session";
import {
  createRequestHeadersWithId,
  getOrCreateRequestId,
  logRequestEvent,
  REQUEST_ID_HEADER,
} from "@/server/observability";
import { hasTrustedMutationOrigin, isApiMutationRequest } from "@/server/security/csrf";

const adminMatcher = /^\/admin(?:\/.*)?$/;

export async function proxy(request: NextRequest) {
  const requestId = getOrCreateRequestId(request);
  const requestHeaders = createRequestHeadersWithId(request, requestId);
  const pathname = request.nextUrl.pathname;

  logRequestEvent({
    type: "request",
    requestId,
    method: request.method,
    pathname,
    outcome: adminMatcher.test(pathname) ? "admin-route" : "public-route",
  });

  if (isApiMutationRequest(request) && !hasTrustedMutationOrigin(request)) {
    logRequestEvent({
      type: "security",
      requestId,
      method: request.method,
      pathname,
      status: 403,
      outcome: "invalid-request-origin",
    });

    const response = NextResponse.json(
      errorResponse(
        ErrorCodes.INVALID_REQUEST_ORIGIN,
        "Request origin is not trusted for cookie-authenticated mutations",
      ),
      { status: 403 },
    );
    response.headers.set(REQUEST_ID_HEADER, requestId);

    return response;
  }

  if (!adminMatcher.test(pathname)) {
    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

    response.headers.set(REQUEST_ID_HEADER, requestId);

    return response;
  }

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);

    logRequestEvent({
      type: "security",
      requestId,
      method: request.method,
      pathname,
      status: 307,
      outcome: "admin-auth-required",
    });

    const response = NextResponse.redirect(loginUrl);
    response.headers.set(REQUEST_ID_HEADER, requestId);

    return response;
  }

  if (session.role !== "ADMIN") {
    logRequestEvent({
      type: "security",
      requestId,
      method: request.method,
      pathname,
      status: 307,
      outcome: "admin-forbidden",
    });

    const response = NextResponse.redirect(new URL("/", request.url));
    response.headers.set(REQUEST_ID_HEADER, requestId);

    return response;
  }

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  response.headers.set(REQUEST_ID_HEADER, requestId);

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
