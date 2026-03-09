import { z } from "zod";

import { PaginationQuerySchema } from "../envelopes";

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

export const PromotionScopeInputSchema = z
  .object({
    scopeType: PromotionScopeTypeSchema,
    targetId: z.string().trim().min(1).optional().nullable(),
  })
  .superRefine((value, context) => {
    if (value.scopeType !== "ALL_PRODUCTS" && !value.targetId) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "targetId is required for scoped promotions",
        path: ["targetId"],
      });
    }
  });

export type PromotionScopeInput = z.infer<typeof PromotionScopeInputSchema>;

export const CreatePromotionSchema = z.object({
  code: z.string().trim().min(1).max(50).optional().nullable(),
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
  codes: z.array(z.string().trim().min(1)).default([]),
  subtotal: z.number().int().min(0),
  productDiscountTotal: z.number().int().min(0).default(0),
  userId: z.string().cuid().optional(),
  items: z
    .array(
      z.object({
        productId: z.string().cuid(),
        productVariantId: z.string().cuid(),
        categoryId: z.string().cuid(),
        unitPrice: z.number().int().min(0),
        qty: z.number().int().min(1),
      }),
    )
    .default([]),
});

export type ValidateVoucherDto = z.infer<typeof ValidateVoucherSchema>;

export const PromotionListQuerySchema = PaginationQuerySchema.extend({
  search: z.string().trim().optional(),
  type: PromotionTypeSchema.optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

export type PromotionListQuery = z.infer<typeof PromotionListQuerySchema>;
