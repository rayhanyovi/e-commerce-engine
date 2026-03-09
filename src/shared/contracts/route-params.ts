import { z } from "zod";

export const EntityIdRouteParamsSchema = z.object({
  id: z.string().cuid(),
});

export const CartItemRouteParamsSchema = z.object({
  itemId: z.string().cuid(),
});

export const OrderRouteParamsSchema = z.object({
  orderId: z.string().cuid(),
});

export const PaymentRouteParamsSchema = z.object({
  paymentId: z.string().cuid(),
});

export const ProductSlugRouteParamsSchema = z.object({
  slug: z.string().trim().min(1).max(255),
});
