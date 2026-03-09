import type {
  AddCartItemDto,
  ApiEnvelope,
  CartSnapshot,
  UpdateCartItemDto,
} from "@/shared/contracts";

function getResponseMessage(
  payload: ApiEnvelope<unknown> | null,
  fallback: string,
) {
  if (payload && !payload.success) {
    return payload.error.message;
  }

  return fallback;
}

async function requestCart<T>(
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
    throw new Error(getResponseMessage(payload, `Cart request failed (${response.status})`));
  }

  return payload.data;
}

export function fetchCart() {
  return requestCart<CartSnapshot>("/api/cart");
}

export function addItemToCart(dto: AddCartItemDto) {
  return requestCart<CartSnapshot>("/api/cart/items", {
    method: "POST",
    body: JSON.stringify(dto),
  });
}

export function updateCartItemQty(itemId: string, dto: UpdateCartItemDto) {
  return requestCart<CartSnapshot>(`/api/cart/items/${itemId}`, {
    method: "PATCH",
    body: JSON.stringify(dto),
  });
}

export function removeCartItemById(itemId: string) {
  return requestCart<CartSnapshot>(`/api/cart/items/${itemId}`, {
    method: "DELETE",
  });
}

export function clearCart() {
  return requestCart<CartSnapshot>("/api/cart", {
    method: "DELETE",
  });
}
