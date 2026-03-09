export interface ShippingCalculationInput {
  subtotalAfterDiscount: number;
  freeShippingThreshold: number | null;
  flatShippingCost: number;
  hasFreeShippingVoucher: boolean;
}

export interface ShippingCalculationResult {
  method: "INTERNAL_FLAT";
  cost: number;
  etaDays: number;
  freeShippingApplied: boolean;
}

export function calculateShipping(
  input: ShippingCalculationInput,
  etaDays: number = 2,
): ShippingCalculationResult {
  const freeByThreshold =
    input.freeShippingThreshold != null &&
    input.subtotalAfterDiscount >= input.freeShippingThreshold;
  const freeShippingApplied = freeByThreshold || input.hasFreeShippingVoucher;

  return {
    method: "INTERNAL_FLAT",
    cost: freeShippingApplied ? 0 : input.flatShippingCost,
    etaDays,
    freeShippingApplied,
  };
}
