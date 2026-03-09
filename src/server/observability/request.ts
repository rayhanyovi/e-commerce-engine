import { randomUUID } from "node:crypto";

import type { NextRequest } from "next/server";

export const REQUEST_ID_HEADER = "x-request-id";

export function getOrCreateRequestId(request: NextRequest) {
  return request.headers.get(REQUEST_ID_HEADER) ?? randomUUID();
}

export function createRequestHeadersWithId(
  request: NextRequest,
  requestId: string,
) {
  const headers = new Headers(request.headers);

  headers.set(REQUEST_ID_HEADER, requestId);

  return headers;
}

export function logRequestEvent(input: {
  requestId: string;
  method: string;
  pathname: string;
  type: "request" | "security";
  status?: number;
  outcome?: string;
}) {
  console.info(
    JSON.stringify({
      type: input.type,
      requestId: input.requestId,
      method: input.method,
      pathname: input.pathname,
      status: input.status,
      outcome: input.outcome,
      timestamp: new Date().toISOString(),
    }),
  );
}
