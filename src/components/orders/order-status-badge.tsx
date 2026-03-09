import type { OrderStatus } from "@/shared/contracts";
import { ORDER_STATUS_STYLES, formatOrderStatusLabel } from "@/lib/orders/presentation";

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${ORDER_STATUS_STYLES[status]}`}
    >
      {formatOrderStatusLabel(status)}
    </span>
  );
}
