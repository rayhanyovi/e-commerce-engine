import type { OrderStatus, PaymentStatus } from "@/shared/contracts";

export type { PaymentStatus } from "@/shared/contracts";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "Pending Payment",
  PAYMENT_REVIEW: "Payment Review",
  PAID: "Paid",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const ORDER_STATUS_STYLES: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "bg-amber-100 text-amber-800",
  PAYMENT_REVIEW: "bg-sky-100 text-sky-800",
  PAID: "bg-emerald-100 text-emerald-800",
  PROCESSING: "bg-violet-100 text-violet-800",
  SHIPPED: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-emerald-100 text-emerald-800",
  CANCELLED: "bg-rose-100 text-rose-800",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: "Pending",
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under Review",
  CONFIRMED: "Confirmed",
  REJECTED: "Rejected",
};

export const PAYMENT_STATUS_STYLES: Record<PaymentStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  SUBMITTED: "bg-sky-100 text-sky-800",
  UNDER_REVIEW: "bg-sky-100 text-sky-800",
  CONFIRMED: "bg-emerald-100 text-emerald-800",
  REJECTED: "bg-rose-100 text-rose-800",
};

export function formatOrderStatusLabel(status: OrderStatus) {
  return ORDER_STATUS_LABELS[status] ?? status;
}

export function formatPaymentStatusLabel(status: PaymentStatus) {
  return PAYMENT_STATUS_LABELS[status] ?? status;
}
