import { z } from "zod";

import { AddressInputSchema } from "./address.dto";

export const OrderStatusSchema = z.enum([
  "PENDING_PAYMENT",
  "PAYMENT_REVIEW",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "COMPLETED",
  "CANCELLED",
]);

export type OrderStatus = z.infer<typeof OrderStatusSchema>;

export const PlaceOrderSchema = z.object({
  shippingAddressId: z.string().cuid().optional(),
  shippingAddress: AddressInputSchema.optional(),
  shippingMethod: z.literal("INTERNAL_FLAT").default("INTERNAL_FLAT"),
  voucherCodes: z.array(z.string()).default([]),
  paymentMethod: z.literal("MANUAL_TRANSFER").default("MANUAL_TRANSFER"),
});

export type PlaceOrderDto = z.infer<typeof PlaceOrderSchema>;

export const UpdateOrderStatusSchema = z.object({
  status: OrderStatusSchema,
  note: z.string().optional(),
});

export type UpdateOrderStatusDto = z.infer<typeof UpdateOrderStatusSchema>;
