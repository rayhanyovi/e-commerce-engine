import type {
  ApiEnvelope,
  CreatePromotionDto,
  UpdatePromotionDto,
} from "@/shared/contracts";

function getEnvelopeMessage(
  payload: ApiEnvelope<unknown> | null,
  fallback: string,
) {
  if (payload && !payload.success) {
    return payload.error.message;
  }

  return fallback;
}

async function requestPromotion<T>(
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
    throw new Error(
      getEnvelopeMessage(payload, `Promotion request failed (${response.status})`),
    );
  }

  return payload.data;
}

export function createPromotionRequest(dto: CreatePromotionDto) {
  return requestPromotion("/api/admin/promotions", {
    method: "POST",
    body: JSON.stringify(dto),
  });
}

export function updatePromotionRequest(
  promotionId: string,
  dto: UpdatePromotionDto,
) {
  return requestPromotion(`/api/admin/promotions/${promotionId}`, {
    method: "PATCH",
    body: JSON.stringify(dto),
  });
}

export function deletePromotionRequest(promotionId: string) {
  return requestPromotion(`/api/admin/promotions/${promotionId}`, {
    method: "DELETE",
  });
}
