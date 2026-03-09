import type {
  ApiEnvelope,
  CheckoutPreviewDto,
  CheckoutPreviewResult,
} from "@/shared/contracts";

async function requestCheckoutPreview(
  dto: Partial<CheckoutPreviewDto> = {},
): Promise<CheckoutPreviewResult> {
  const response = await fetch("/api/checkout/preview", {
    method: "POST",
    cache: "no-store",
    credentials: "same-origin",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      shippingMethod: "INTERNAL_FLAT",
      voucherCodes: dto.voucherCodes ?? [],
    }),
  });
  const payload = (await response.json().catch(() => null)) as
    | ApiEnvelope<CheckoutPreviewResult>
    | null;

  if (!response.ok || !payload || !payload.success) {
    throw new Error(
      payload && !payload.success
        ? payload.error.message
        : `Checkout preview failed (${response.status})`,
    );
  }

  return payload.data;
}

export function fetchCheckoutPreview(dto: Partial<CheckoutPreviewDto> = {}) {
  return requestCheckoutPreview(dto);
}
