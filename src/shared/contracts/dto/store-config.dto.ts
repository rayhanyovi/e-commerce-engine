import { z } from "zod";

export const UpdateStoreConfigSchema = z.object({
  key: z.string().min(1),
  value: z.string(),
  label: z.string().optional(),
});

export type UpdateStoreConfigDto = z.infer<typeof UpdateStoreConfigSchema>;

export const BulkUpdateStoreConfigSchema = z.object({
  configs: z.array(UpdateStoreConfigSchema),
});

export type BulkUpdateStoreConfigDto = z.infer<typeof BulkUpdateStoreConfigSchema>;

export const StoreConfigKeys = {
  STORE_NAME: "STORE_NAME",
  CURRENCY: "CURRENCY",
  TIMEZONE: "TIMEZONE",
  ALLOW_GUEST_CHECKOUT: "ALLOW_GUEST_CHECKOUT",
  MAX_VOUCHERS_PER_ORDER: "MAX_VOUCHERS_PER_ORDER",
  ALLOW_VOUCHER_STACKING: "ALLOW_VOUCHER_STACKING",
  ALLOW_VOUCHER_WITH_PRODUCT_DISCOUNT: "ALLOW_VOUCHER_WITH_PRODUCT_DISCOUNT",
  FREE_SHIPPING_THRESHOLD: "FREE_SHIPPING_THRESHOLD",
  INTERNAL_FLAT_SHIPPING_COST: "INTERNAL_FLAT_SHIPPING_COST",
  INTERNAL_FLAT_SHIPPING_ETA_DAYS: "INTERNAL_FLAT_SHIPPING_ETA_DAYS",
  PAYMENT_TRANSFER_INSTRUCTIONS: "PAYMENT_TRANSFER_INSTRUCTIONS",
} as const;

export type StoreConfigKey = (typeof StoreConfigKeys)[keyof typeof StoreConfigKeys];
