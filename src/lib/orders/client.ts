import type {
  ApiEnvelope,
  PlaceOrderDto,
  UpdateOrderStatusDto,
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

async function requestOrder<T>(
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
    throw new Error(getEnvelopeMessage(payload, `Order request failed (${response.status})`));
  }

  return payload.data;
}

export function placeOrderRequest(
  dto: PlaceOrderDto,
  idempotencyKey: string,
) {
  return requestOrder<{ id: string; orderNumber: string }>("/api/orders", {
    method: "POST",
    body: JSON.stringify(dto),
    headers: {
      "idempotency-key": idempotencyKey,
    },
  });
}

export function updateAdminOrderStatusRequest(
  orderId: string,
  dto: UpdateOrderStatusDto,
) {
  return requestOrder(`/api/admin/orders/${orderId}/status`, {
    method: "PATCH",
    body: JSON.stringify(dto),
  });
}
