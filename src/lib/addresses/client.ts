import type {
  AddressRecord,
  ApiEnvelope,
  CreateAddressDto,
  UpdateAddressDto,
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

async function requestAddress<T>(
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
    throw new Error(getEnvelopeMessage(payload, `Address request failed (${response.status})`));
  }

  return payload.data;
}

export function listMyAddressesRequest() {
  return requestAddress<AddressRecord[]>("/api/addresses");
}

export function createAddressRequest(dto: CreateAddressDto) {
  return requestAddress<AddressRecord>("/api/addresses", {
    method: "POST",
    body: JSON.stringify(dto),
  });
}

export function updateAddressRequest(addressId: string, dto: UpdateAddressDto) {
  return requestAddress<AddressRecord>(`/api/addresses/${addressId}`, {
    method: "PATCH",
    body: JSON.stringify(dto),
  });
}

export function deleteAddressRequest(addressId: string) {
  return requestAddress<{ deleted: boolean }>(`/api/addresses/${addressId}`, {
    method: "DELETE",
  });
}
