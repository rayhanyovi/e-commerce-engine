import { z } from "zod";

import { AddressInputSchema } from "./address.dto";
import { PaginationQuerySchema } from "../envelopes";

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

export const CheckoutPreviewSchema = z.object({
  shippingMethod: z.literal("INTERNAL_FLAT").default("INTERNAL_FLAT"),
  voucherCodes: z.array(z.string().trim().min(1)).default([]),
});

export type CheckoutPreviewDto = z.infer<typeof CheckoutPreviewSchema>;

export const CheckoutPreviewItemSchema = z.object({
  productId: z.string().cuid(),
  productVariantId: z.string().cuid(),
  productName: z.string(),
  variantLabel: z.string(),
  unitPrice: z.number().int().min(0),
  qty: z.number().int().min(1),
  lineSubtotal: z.number().int().min(0),
});

export const CheckoutPreviewVoucherSchema = z.object({
  code: z.string(),
  discount: z.number().int().min(0),
  type: z.enum(["PERCENTAGE", "FIXED_AMOUNT", "FREE_PRODUCT", "FREE_SHIPPING"]),
});

export const CheckoutPreviewRejectedVoucherSchema = z.object({
  code: z.string(),
  reason: z.string(),
});

export const CheckoutPreviewResultSchema = z.object({
  items: z.array(CheckoutPreviewItemSchema),
  subtotal: z.number().int().min(0),
  productDiscountTotal: z.number().int().min(0),
  voucherDiscountTotal: z.number().int().min(0),
  shippingCost: z.number().int().min(0),
  grandTotal: z.number().int().min(0),
  appliedVouchers: z.array(CheckoutPreviewVoucherSchema),
  rejectedVouchers: z.array(CheckoutPreviewRejectedVoucherSchema),
  shippingMethod: z.literal("INTERNAL_FLAT"),
  shippingEtaDays: z.number().int().min(0),
  allowGuestCheckout: z.boolean(),
});

export type CheckoutPreviewItem = z.infer<typeof CheckoutPreviewItemSchema>;
export type CheckoutPreviewVoucher = z.infer<typeof CheckoutPreviewVoucherSchema>;
export type CheckoutPreviewRejectedVoucher = z.infer<typeof CheckoutPreviewRejectedVoucherSchema>;
export type CheckoutPreviewResult = z.infer<typeof CheckoutPreviewResultSchema>;

export const OrderListQuerySchema = PaginationQuerySchema.extend({
  status: OrderStatusSchema.optional(),
  search: z.string().optional(),
});

export type OrderListQuery = z.infer<typeof OrderListQuerySchema>;

export const UpdateOrderStatusSchema = z.object({
  status: OrderStatusSchema,
  note: z.string().optional(),
});

export type UpdateOrderStatusDto = z.infer<typeof UpdateOrderStatusSchema>;
