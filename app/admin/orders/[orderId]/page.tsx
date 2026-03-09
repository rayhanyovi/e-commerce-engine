import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminOrderStatusForm } from "@/components/admin/admin-order-status-form";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { PaymentStatusBadge } from "@/components/orders/payment-status-badge";
import { formatCurrency, formatDateTime } from "@/lib/formatters";
import { getAdminOrderById } from "@/server/orders";
import { AppError } from "@/server/http";
import { ErrorCodes } from "@/shared/contracts";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  let order: Awaited<ReturnType<typeof getAdminOrderById>> | null = null;

  try {
    order = await getAdminOrderById(orderId);
  } catch (error) {
    if (error instanceof AppError && error.code === ErrorCodes.NOT_FOUND) {
      notFound();
    }

    throw error;
  }

  return (
    <div className="space-y-8">
      <Link href="/admin/orders" className="text-sm text-muted transition hover:text-foreground">
        Back to Orders
      </Link>

      <section className="rounded-[1.75rem] border border-border bg-surface p-6 lg:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-muted">Admin Order Detail</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight">{order.orderNumber}</h1>
            <p className="mt-3 text-sm text-muted">
              {order.customerSnapshot.name} · {order.customerSnapshot.email || "No email snapshot"}
            </p>
            <p className="mt-2 text-sm text-muted">Placed {formatDateTime(order.placedAt)}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <OrderStatusBadge status={order.status} />
            {order.latestPayment ? <PaymentStatusBadge status={order.latestPayment.status} /> : null}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <section className="rounded-[1.5rem] border border-border bg-surface p-5">
            <h2 className="text-lg font-semibold">Line Items</h2>
            <div className="mt-4 space-y-3">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-border bg-background px-4 py-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{item.productNameSnapshot}</p>
                      <p className="mt-1 text-sm text-muted">
                        {item.variantLabelSnapshot || "-"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted">{item.qty} item(s)</p>
                      <p className="mt-1 font-medium">{formatCurrency(item.lineSubtotalSnapshot)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[1.5rem] border border-border bg-surface p-5">
            <h2 className="text-lg font-semibold">Reservations and Promotions</h2>
            <div className="mt-4 space-y-4">
              <div className="rounded-2xl border border-border bg-background px-4 py-4 text-sm text-muted">
                <p className="font-medium text-foreground">Reservations</p>
                <p className="mt-2">{order.reservations.length} reservation record(s)</p>
              </div>
              <div className="rounded-2xl border border-border bg-background px-4 py-4 text-sm text-muted">
                <p className="font-medium text-foreground">Applied promotions</p>
                {order.promotions.length ? (
                  <div className="mt-2 space-y-2">
                    {order.promotions.map((promotionUsage) => (
                      <p key={promotionUsage.id}>
                        {promotionUsage.promotion.code || promotionUsage.promotion.id} ·{" "}
                        {promotionUsage.promotion.type}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2">No promotion usage recorded on this order.</p>
                )}
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <AdminOrderStatusForm orderId={order.id} currentStatus={order.status} />

          <section className="rounded-[1.5rem] border border-border bg-surface p-5">
            <h2 className="text-lg font-semibold">Financial Summary</h2>
            <div className="mt-4 space-y-3 text-sm text-muted">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Product discount</span>
                <span>- {formatCurrency(order.productDiscountTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Voucher</span>
                <span>- {formatCurrency(order.voucherDiscountTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{formatCurrency(order.shippingCost)}</span>
              </div>
              <div className="flex justify-between text-base font-semibold text-foreground">
                <span>Total</span>
                <span>{formatCurrency(order.grandTotal)}</span>
              </div>
            </div>
          </section>

          <section className="rounded-[1.5rem] border border-border bg-surface p-5">
            <h2 className="text-lg font-semibold">Customer Snapshot</h2>
            <div className="mt-4 space-y-2 text-sm text-muted">
              <p>{order.customerSnapshot.name}</p>
              <p>{order.customerSnapshot.email || "No email snapshot"}</p>
              <p>{order.customerSnapshot.phone || "No phone snapshot"}</p>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
