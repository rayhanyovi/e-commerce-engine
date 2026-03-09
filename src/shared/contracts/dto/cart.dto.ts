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
