import type {
  ApiEnvelope,
  LoginDto,
  RegisterDto,
} from "@/shared/contracts";

export interface AuthSessionRecord {
  id: string;
  role: "CUSTOMER" | "ADMIN";
  email: string;
  name: string;
  phone: string | null;
}

interface AuthSuccessPayload {
  user: AuthSessionRecord;
}

function getEnvelopeMessage(
  payload: ApiEnvelope<unknown> | null,
  fallback: string,
) {
  if (payload && !payload.success) {
    return payload.error.message;
  }

  return fallback;
}

async function requestAuth<T>(
  input: RequestInfo | URL,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(input, {
    ...init,
    cache: "no-store",
    credentials: "same-origin",
    headers: {
      ...(init.body ? { "content-type": "application/json" } : {}),
      ...init.headers,
    },
  });
  const payload = (await response.json().catch(() => null)) as ApiEnvelope<T> | null;

  if (!response.ok || !payload || !payload.success) {
    throw new Error(getEnvelopeMessage(payload, `Auth request failed (${response.status})`));
  }

  return payload.data;
}

export function loginRequest(dto: LoginDto) {
  return requestAuth<AuthSuccessPayload>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(dto),
  });
}

export function registerRequest(dto: RegisterDto) {
  return requestAuth<AuthSuccessPayload>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(dto),
  });
}

export function logoutRequest() {
  return requestAuth<{ success: true }>("/api/auth/logout", {
    method: "POST",
  });
}

export function getSessionRequest() {
  return requestAuth<AuthSessionRecord>("/api/me");
}
