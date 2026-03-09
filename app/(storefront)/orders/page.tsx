import Link from "next/link";

import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { PaymentStatusBadge } from "@/components/orders/payment-status-badge";
import { formatCurrency, formatDateTime } from "@/lib/formatters";
import { toFlatSearchParams, type SearchParamInput } from "@/lib/search-params";
import { getServerCurrentUser } from "@/server/auth";
import { listMyOrders } from "@/server/orders";
import { OrderListQuerySchema } from "@/shared/contracts";

export const dynamic = "force-dynamic";

function buildOrdersHref(
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

  return query ? `/orders?${query}` : "/orders";
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamInput>;
}) {
  const user = await getServerCurrentUser();
  const currentSearchParams = toFlatSearchParams(await searchParams);
  const query = OrderListQuerySchema.parse(currentSearchParams);

  if (!user) {
    return (
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10 lg:px-10">
        <section className="rounded-[2rem] border border-border bg-surface p-8 lg:p-10">
          <p className="text-sm uppercase tracking-[0.18em] text-muted">My Orders</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">
            Login is required to review your orders
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
            Orders sekarang sudah berjalan di root Next app dan terikat ke ownership check user.
            Masuk dulu untuk melihat histori order dan detail pembayaran yang terkait.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/login?redirect=/orders"
              className="rounded-full bg-accent px-5 py-3 text-sm font-medium text-white"
            >
              Login to Continue
            </Link>
            <Link
              href="/products"
              className="rounded-full border border-border px-5 py-3 text-sm font-medium text-muted transition hover:text-foreground"
            >
              Browse Products
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const result = await listMyOrders(user.id, query);
  const totalPages = Math.max(1, Math.ceil(result.total / query.pageSize));

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10 lg:px-10">
      <section className="rounded-[1.75rem] border border-border bg-surface p-6 lg:p-8">
        <p className="text-sm uppercase tracking-[0.18em] text-muted">My Orders</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">Customer self-service is live</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
          Halaman ini sekarang membaca order history milik user aktif dari orders module baru, bukan
          mock summary lagi.
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
            href="/orders"
            className="rounded-full border border-border px-5 py-3 text-sm font-medium text-muted transition hover:text-foreground"
          >
            Reset
          </Link>
        </div>
      </form>

      {!result.orders.length ? (
        <section className="rounded-[1.5rem] border border-border bg-surface p-8 text-sm text-muted">
          No orders matched the current filters yet.
        </section>
      ) : (
        <section className="space-y-4">
          {result.orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="block rounded-[1.5rem] border border-border bg-surface p-5 transition hover:border-accent"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl font-semibold">{order.orderNumber}</h2>
                    <OrderStatusBadge status={order.status} />
                    {order.latestPayment ? (
                      <PaymentStatusBadge status={order.latestPayment.status} />
                    ) : null}
                  </div>
                  <p className="text-sm text-muted">
                    Placed {formatDateTime(order.placedAt)} · {order.itemCount} item(s)
                  </p>
                  <p className="text-sm text-muted">
                    Shipping to {order.addressSnapshot.recipientName || "Unknown recipient"}
                  </p>
                </div>
                <div className="text-left lg:text-right">
                  <p className="text-sm text-muted">Grand total</p>
                  <p className="mt-2 text-2xl font-semibold">{formatCurrency(order.grandTotal)}</p>
                </div>
              </div>
            </Link>
          ))}
        </section>
      )}

      {totalPages > 1 ? (
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href={buildOrdersHref(currentSearchParams, {
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
            href={buildOrdersHref(currentSearchParams, {
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
    </main>
  );
}
