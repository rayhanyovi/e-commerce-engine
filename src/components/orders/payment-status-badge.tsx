import type { PaymentStatus } from "@/lib/orders/presentation";
import {
  PAYMENT_STATUS_STYLES,
  formatPaymentStatusLabel,
} from "@/lib/orders/presentation";

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${PAYMENT_STATUS_STYLES[status]}`}
    >
      {formatPaymentStatusLabel(status)}
    </span>
  );
}
