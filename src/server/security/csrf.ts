import type { NextRequest } from "next/server";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

function normalizeOrigin(value: string | null) {
  if (!value) {
    return null;
  }

  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

function getAllowedOrigins(request: NextRequest) {
  const origins = new Set<string>([request.nextUrl.origin]);
  const appOrigin = normalizeOrigin(process.env.APP_URL ?? null);

  if (appOrigin) {
    origins.add(appOrigin);
  }

  return origins;
}

export function isApiMutationRequest(request: NextRequest) {
  return request.nextUrl.pathname.startsWith("/api/") && !SAFE_METHODS.has(request.method);
}

export function hasTrustedMutationOrigin(request: NextRequest) {
  if (!isApiMutationRequest(request)) {
    return true;
  }

  const candidateOrigin =
    normalizeOrigin(request.headers.get("origin")) ??
    normalizeOrigin(request.headers.get("referer"));

  if (!candidateOrigin) {
    return false;
  }

  return getAllowedOrigins(request).has(candidateOrigin);
}
