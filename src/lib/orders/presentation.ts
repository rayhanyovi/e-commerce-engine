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
  PENDING_PAYMENT: "bg-status-warning/15 text-status-warning-foreground",
  PAYMENT_REVIEW: "bg-status-info/15 text-status-info-foreground",
  PAID: "bg-status-success/15 text-status-success-foreground",
  PROCESSING: "bg-status-purple/15 text-status-purple-foreground",
  SHIPPED: "bg-primary/10 text-primary",
  COMPLETED: "bg-status-success/15 text-status-success-foreground",
  CANCELLED: "bg-status-danger/15 text-status-danger-foreground",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: "Pending",
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under Review",
  CONFIRMED: "Confirmed",
  REJECTED: "Rejected",
};

export const PAYMENT_STATUS_STYLES: Record<PaymentStatus, string> = {
  PENDING: "bg-status-warning/15 text-status-warning-foreground",
  SUBMITTED: "bg-status-info/15 text-status-info-foreground",
  UNDER_REVIEW: "bg-status-info/15 text-status-info-foreground",
  CONFIRMED: "bg-status-success/15 text-status-success-foreground",
  REJECTED: "bg-status-danger/15 text-status-danger-foreground",
};

export function formatOrderStatusLabel(status: OrderStatus) {
  return ORDER_STATUS_LABELS[status] ?? status;
}

export function formatPaymentStatusLabel(status: PaymentStatus) {
  return PAYMENT_STATUS_LABELS[status] ?? status;
}
