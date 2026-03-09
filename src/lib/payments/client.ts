import type {
  ApiEnvelope,
  ReviewPaymentDto,
  UploadPaymentProofDto,
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

async function requestPayment<T>(
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
    throw new Error(getEnvelopeMessage(payload, `Payment request failed (${response.status})`));
  }

  return payload.data;
}

export function uploadPaymentProofRequest(
  orderId: string,
  dto: UploadPaymentProofDto,
) {
  return requestPayment(`/api/orders/${orderId}/payment-proof`, {
    method: "POST",
    body: JSON.stringify(dto),
  });
}

export function reviewPaymentRequest(
  paymentId: string,
  dto: ReviewPaymentDto,
) {
  return requestPayment(`/api/admin/payments/${paymentId}/review`, {
    method: "POST",
    body: JSON.stringify(dto),
  });
}
