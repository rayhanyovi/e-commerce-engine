import { z } from "zod";

export const PromotionTypeSchema = z.enum([
  "PERCENTAGE",
  "FIXED_AMOUNT",
  "FREE_PRODUCT",
  "FREE_SHIPPING",
]);

export type PromotionType = z.infer<typeof PromotionTypeSchema>;

export const PromotionScopeTypeSchema = z.enum([
  "ALL_PRODUCTS",
  "CATEGORY",
  "PRODUCT",
  "VARIANT",
]);

export type PromotionScopeType = z.infer<typeof PromotionScopeTypeSchema>;

export const PromotionScopeInputSchema = z.object({
  scopeType: PromotionScopeTypeSchema,
  targetId: z.string().optional().nullable(),
});

export const CreatePromotionSchema = z.object({
  code: z.string().min(1).max(50).optional().nullable(),
  type: PromotionTypeSchema,
  value: z.number().int().min(0),
  minPurchase: z.number().int().min(0).optional().nullable(),
  maxDiscountCap: z.number().int().min(0).optional().nullable(),
  validFrom: z.coerce.date(),
  validUntil: z.coerce.date(),
  totalUsageLimit: z.number().int().min(0).optional().nullable(),
  perUserUsageLimit: z.number().int().min(0).optional().nullable(),
  isActive: z.boolean().default(true),
  isStackable: z.boolean().default(false),
  scopes: z
    .array(PromotionScopeInputSchema)
    .default([{ scopeType: "ALL_PRODUCTS", targetId: null }]),
});

export type CreatePromotionDto = z.infer<typeof CreatePromotionSchema>;

export const UpdatePromotionSchema = CreatePromotionSchema.partial();

export type UpdatePromotionDto = z.infer<typeof UpdatePromotionSchema>;

export const ValidateVoucherSchema = z.object({
  codes: z.array(z.string().min(1)),
});

export type ValidateVoucherDto = z.infer<typeof ValidateVoucherSchema>;
