import type {
  ApiEnvelope,
  CreateCategoryDto,
  UpdateCategoryDto,
} from "@/shared/contracts";

export interface CategoryMutationRecord {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
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

async function requestCategory<T>(
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
    throw new Error(getEnvelopeMessage(payload, `Category request failed (${response.status})`));
  }

  return payload.data;
}

export function createCategoryRequest(dto: CreateCategoryDto) {
  return requestCategory<CategoryMutationRecord>("/api/admin/categories", {
    method: "POST",
    body: JSON.stringify(dto),
  });
}

export function updateCategoryRequest(categoryId: string, dto: UpdateCategoryDto) {
  return requestCategory<CategoryMutationRecord>(`/api/admin/categories/${categoryId}`, {
    method: "PATCH",
    body: JSON.stringify(dto),
  });
}

export function deleteCategoryRequest(categoryId: string) {
  return requestCategory<{ deleted: boolean }>(`/api/admin/categories/${categoryId}`, {
    method: "DELETE",
  });
}
