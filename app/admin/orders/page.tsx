import Link from "next/link";

import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { PaymentStatusBadge } from "@/components/orders/payment-status-badge";
import { formatCurrency, formatDateTime } from "@/lib/formatters";
import { toFlatSearchParams, type SearchParamInput } from "@/lib/search-params";
import { listAdminOrders } from "@/server/orders";
import { OrderListQuerySchema } from "@/shared/contracts";

export const dynamic = "force-dynamic";

function buildAdminOrdersHref(
  current: Record<string, string | undefined>,
  updates: Record<string, string | undefined>,
) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries({ ...current, ...updates })) {
    if (value) {
      params.set(key, value);
    }
  }

  const query = params.toString();

  return query ? `/admin/orders?${query}` : "/admin/orders";
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamInput>;
}) {
  const currentSearchParams = toFlatSearchParams(await searchParams);
  const query = OrderListQuerySchema.parse(currentSearchParams);
  const result = await listAdminOrders(query);
  const totalPages = Math.max(1, Math.ceil(result.total / query.pageSize));

  return (
    <div className="space-y-8">
      <section className="rounded-[1.75rem] border border-border bg-surface p-6 lg:p-8">
        <p className="text-sm uppercase tracking-[0.18em] text-muted">Admin Orders</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">
          Order operations moved to the root app
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
          Admin list, detail, dan status transition sekarang dibaca dari orders module Next yang
          sudah terhubung ke reservation dan payment state dasar.
        </p>
      </section>

      <form className="grid gap-4 rounded-[1.5rem] border border-border bg-surface p-5 md:grid-cols-[1.2fr_0.8fr_auto]">
        <input
          name="search"
          defaultValue={query.search ?? ""}
          placeholder="Search order number..."
          className="w-full rounded-2xl border border-border bg-background px-4 py-3 outline-none transition focus:border-accent"
        />
        <select
          name="status"
          defaultValue={query.status ?? ""}
          className="w-full rounded-2xl border border-border bg-background px-4 py-3 outline-none transition focus:border-accent"
        >
          <option value="">All statuses</option>
          <option value="PENDING_PAYMENT">Pending Payment</option>
          <option value="PAYMENT_REVIEW">Payment Review</option>
          <option value="PAID">Paid</option>
          <option value="PROCESSING">Processing</option>
          <option value="SHIPPED">Shipped</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        <div className="flex gap-3">
          <input type="hidden" name="page" value="1" />
          <input type="hidden" name="pageSize" value={String(query.pageSize)} />
          <button className="rounded-full bg-accent px-5 py-3 text-sm font-medium text-white">
            Filter
          </button>
          <Link
            href="/admin/orders"
            className="rounded-full border border-border px-5 py-3 text-sm font-medium text-muted transition hover:text-foreground"
          >
            Reset
          </Link>
        </div>
      </form>

      {!result.orders.length ? (
        <section className="rounded-[1.5rem] border border-border bg-surface p-8 text-sm text-muted">
          No orders matched the current admin filters.
        </section>
      ) : (
        <section className="space-y-4">
          {result.orders.map((order) => (
            <Link
              key={order.id}
              href={`/admin/orders/${order.id}`}
              className="block rounded-[1.5rem] border border-border bg-surface p-5 transition hover:border-accent"
            >
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl font-semibold">{order.orderNumber}</h2>
                    <OrderStatusBadge status={order.status} />
                    {order.latestPayment ? (
                      <PaymentStatusBadge status={order.latestPayment.status} />
                    ) : null}
                  </div>
                  <p className="text-sm text-muted">
                    {order.customerSnapshot.name} · {order.customerSnapshot.email || "No email"}
                  </p>
                  <p className="text-sm text-muted">
                    {formatDateTime(order.placedAt)} · {order.itemCount} item(s)
                  </p>
                </div>
                <div className="grid gap-2 text-left text-sm text-muted xl:text-right">
                  <p>Total {formatCurrency(order.grandTotal, order.currency)}</p>
                  <p>Shipping {order.shippingMethod}</p>
                  <p>Latest payment {order.latestPayment?.method || "-"}</p>
                </div>
              </div>
            </Link>
          ))}
        </section>
      )}

      {totalPages > 1 ? (
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href={buildAdminOrdersHref(currentSearchParams, {
              page: query.page > 1 ? String(query.page - 1) : "1",
            })}
            className={`rounded-full border px-5 py-3 text-sm font-medium transition ${
              query.page === 1
                ? "pointer-events-none border-border text-muted/50"
                : "border-border text-muted hover:text-foreground"
            }`}
          >
            Previous
          </Link>
          <span className="text-sm text-muted">
            Page {query.page} of {totalPages}
          </span>
          <Link
            href={buildAdminOrdersHref(currentSearchParams, {
              page: query.page < totalPages ? String(query.page + 1) : String(totalPages),
            })}
            className={`rounded-full border px-5 py-3 text-sm font-medium transition ${
              query.page >= totalPages
                ? "pointer-events-none border-border text-muted/50"
                : "border-border text-muted hover:text-foreground"
            }`}
          >
            Next
          </Link>
        </div>
      ) : null}
    </div>
  );
}
