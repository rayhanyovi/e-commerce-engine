import type { ApiEnvelope, BulkUpdateStoreConfigDto } from "@/shared/contracts";

function getEnvelopeMessage(
  payload: ApiEnvelope<unknown> | null,
  fallback: string,
) {
  if (payload && !payload.success) {
    return payload.error.message;
  }

  return fallback;
}

async function requestSettings<T>(
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
    throw new Error(getEnvelopeMessage(payload, `Settings request failed (${response.status})`));
  }

  return payload.data;
}

export function updateStoreSettingsRequest(dto: BulkUpdateStoreConfigDto) {
  return requestSettings<{
    updatedCount: number;
    createdCount: number;
  }>("/api/admin/settings", {
    method: "PATCH",
    body: JSON.stringify(dto),
  });
}

export function initializeStoreSettingsRequest() {
  return requestSettings<{
    createdCount: number;
  }>("/api/admin/settings/initialize", {
    method: "POST",
  });
}
