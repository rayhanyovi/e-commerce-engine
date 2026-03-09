import type { OrderStatus } from "@/shared/contracts";

export type OrderStatusType = OrderStatus;

export interface OrderEntity {
  id: string;
  orderNumber: string;
  userId?: string | null;
  customerSnapshot: { name: string; email: string; phone?: string };
  addressSnapshot: Record<string, unknown>;
  currency: string;
  subtotal: number;
  productDiscountTotal: number;
  voucherDiscountTotal: number;
  shippingCost: number;
  grandTotal: number;
  status: OrderStatusType;
  shippingMethod: string;
  shippingEtaDays: number;
  idempotencyKey?: string | null;
  placedAt: Date;
}

export interface OrderItemEntity {
  id: string;
  orderId: string;
  productId: string;
  productVariantId: string;
  productNameSnapshot: string;
  variantLabelSnapshot: string;
  unitPriceSnapshot: number;
  qty: number;
  lineDiscountSnapshot: number;
  lineSubtotalSnapshot: number;
}

export const ORDER_STATUS_TRANSITIONS: Record<OrderStatusType, OrderStatusType[]> = {
  PENDING_PAYMENT: ["PAYMENT_REVIEW", "CANCELLED"],
  PAYMENT_REVIEW: ["PAID", "PENDING_PAYMENT", "CANCELLED"],
  PAID: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
};

export function isValidStatusTransition(from: OrderStatusType, to: OrderStatusType): boolean {
  return ORDER_STATUS_TRANSITIONS[from]?.includes(to) ?? false;
}
