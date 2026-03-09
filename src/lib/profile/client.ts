import type {
  ApiEnvelope,
  UpdateProfileDto,
} from "@/shared/contracts";

export interface ProfileRecord {
  id: string;
  role: "CUSTOMER" | "ADMIN";
  email: string;
  name: string;
  phone: string | null;
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

async function requestProfile<T>(
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
    throw new Error(getEnvelopeMessage(payload, `Profile request failed (${response.status})`));
  }

  return payload.data;
}

export function getMyProfileRequest() {
  return requestProfile<ProfileRecord>("/api/me");
}

export function updateMyProfileRequest(dto: UpdateProfileDto) {
  return requestProfile<ProfileRecord>("/api/me", {
    method: "PATCH",
    body: JSON.stringify(dto),
  });
}
