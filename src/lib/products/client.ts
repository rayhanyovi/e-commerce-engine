import type {
  ApiEnvelope,
  CreateProductDto,
  UpdateProductDto,
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

async function requestProduct<T>(
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
    throw new Error(getEnvelopeMessage(payload, `Product request failed (${response.status})`));
  }

  return payload.data;
}

export function createProductRequest(dto: CreateProductDto) {
  return requestProduct<{ id: string }>("/api/admin/products", {
    method: "POST",
    body: JSON.stringify(dto),
  });
}

export function updateProductRequest(productId: string, dto: UpdateProductDto) {
  return requestProduct(`/api/admin/products/${productId}`, {
    method: "PATCH",
    body: JSON.stringify(dto),
  });
}

export function deleteProductRequest(productId: string) {
  return requestProduct<{ deleted: boolean }>(`/api/admin/products/${productId}`, {
    method: "DELETE",
  });
}
