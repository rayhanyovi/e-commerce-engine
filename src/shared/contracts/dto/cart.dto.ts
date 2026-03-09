import { z } from "zod";

export const AddCartItemSchema = z.object({
  productId: z.string().cuid(),
  productVariantId: z.string().cuid(),
  qty: z.number().int().min(1),
});

export type AddCartItemDto = z.infer<typeof AddCartItemSchema>;

export const UpdateCartItemSchema = z.object({
  qty: z.number().int().min(1),
});

export type UpdateCartItemDto = z.infer<typeof UpdateCartItemSchema>;

export const CartStatusSchema = z.enum(["ACTIVE", "CONVERTED", "ABANDONED"]);

const CartDateValueSchema = z.union([z.date(), z.string()]);

export const CartItemVariantOptionSchema = z.object({
  optionValue: z.object({
    value: z.string(),
    optionDefinition: z.object({
      name: z.string(),
    }),
  }),
});

export const CartItemProductSchema = z.object({
  id: z.string().cuid(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  basePrice: z.number().int().min(0),
  promoPrice: z.number().int().min(0).nullable(),
  isActive: z.boolean(),
  mediaUrls: z.array(z.string()),
});

export const CartItemVariantSchema = z.object({
  id: z.string().cuid(),
  sku: z.string().nullable(),
  priceOverride: z.number().int().min(0).nullable(),
  stockOnHand: z.number().int().min(0),
  isActive: z.boolean(),
  optionCombination: z.array(CartItemVariantOptionSchema),
});

export const CartItemWarningsSchema = z.object({
  inactiveProduct: z.boolean(),
  inactiveVariant: z.boolean(),
  insufficientStock: z.boolean(),
  availableQty: z.number().int().min(0),
});

export const CartItemSnapshotSchema = z.object({
  id: z.string().cuid(),
  cartId: z.string().cuid(),
  productId: z.string().cuid(),
  productVariantId: z.string().cuid(),
  qty: z.number().int().min(1),
  unitPrice: z.number().int().min(0),
  lineTotal: z.number().int().min(0),
  variantLabel: z.string(),
  product: CartItemProductSchema,
  variant: CartItemVariantSchema,
  warnings: CartItemWarningsSchema,
});

export const CartSummarySchema = z.object({
  itemCount: z.number().int().min(0),
  subtotal: z.number().int().min(0),
});

export const CartSnapshotSchema = z.object({
  id: z.string().cuid(),
  userId: z.string().cuid().nullable(),
  guestToken: z.string().nullable(),
  status: CartStatusSchema,
  createdAt: CartDateValueSchema,
  updatedAt: CartDateValueSchema,
  items: z.array(CartItemSnapshotSchema),
  summary: CartSummarySchema,
});

export type CartItemVariantOption = z.infer<typeof CartItemVariantOptionSchema>;
export type CartItemProduct = z.infer<typeof CartItemProductSchema>;
export type CartItemVariant = z.infer<typeof CartItemVariantSchema>;
export type CartItemWarnings = z.infer<typeof CartItemWarningsSchema>;
export type CartItemSnapshot = z.infer<typeof CartItemSnapshotSchema>;
export type CartSummary = z.infer<typeof CartSummarySchema>;
export type CartSnapshot = z.infer<typeof CartSnapshotSchema>;
