import Link from "next/link";

import { DataState } from "@/components/ui/data-state";
import { formatCurrency, formatDateTime } from "@/lib/formatters";
import { toUserFacingErrorMessage } from "@/lib/user-facing-error";
import { getAdminDashboardSummary } from "@/server/dashboard";

export const dynamic = "force-dynamic";

function statusBadgeClass(status: string) {
  switch (status) {
    case "PAID":
    case "COMPLETED":
    case "CONFIRMED":
      return "bg-emerald-100 text-emerald-800";
    case "PAYMENT_REVIEW":
    case "SUBMITTED":
    case "UNDER_REVIEW":
      return "bg-amber-100 text-amber-800";
    case "PENDING_PAYMENT":
      return "bg-sky-100 text-sky-800";
    case "CANCELLED":
    case "REJECTED":
      return "bg-red-100 text-red-700";
    default:
      return "bg-slate-200 text-slate-700";
  }
}

export default async function AdminDashboardPage() {
  let summary: Awaited<ReturnType<typeof getAdminDashboardSummary>> | null = null;
  let errorMessage: string | null = null;

  try {
    summary = await getAdminDashboardSummary();
  } catch (error) {
    errorMessage = toUserFacingErrorMessage(
      error,
      "Admin dashboard data could not be loaded right now. Try again after the database setup is ready.",
    );
  }

  if (!summary) {
    return (
      <DataState
        tone="error"
        eyebrow="Dashboard Error"
        title="Admin dashboard is not available"
        description={
          errorMessage ??
          "Admin dashboard data could not be loaded right now. Try again after the database setup is ready."
        }
        actions={[
          { href: "/admin", label: "Reload dashboard" },
          { href: "/", label: "Back to storefront", variant: "secondary" },
        ]}
      />
    );
  }

  const urgentAlertCount =
    Number(summary.metrics.paymentReviewCount > 0) +
    Number(summary.metrics.lowStockCount > 0) +
    Number(summary.metrics.missingConfigCount > 0);

  return (
    <div className="space-y-8">
      <section className="rounded-[1.75rem] border border-border bg-surface p-6 lg:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-muted">Admin Overview</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight">Operations Dashboard</h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-muted">
              Dashboard ini jadi pintu masuk operasional admin untuk melihat order flow, payment
              review queue, inventory risk, config gaps, dan aktivitas terbaru tanpa pindah module
              dulu.
            </p>
          </div>
          <Link
            href="/api/admin/dashboard"
            className="rounded-full border border-border px-4 py-2 text-sm text-muted transition hover:text-foreground"
          >
            Inspect API
          </Link>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[1.5rem] border border-border bg-background p-5">
            <p className="text-sm text-muted">Total Orders</p>
            <div className="mt-3 text-3xl font-semibold">{summary.metrics.totalOrders}</div>
            <p className="mt-2 text-sm text-muted">
              {summary.metrics.pendingOrders} order(s) still waiting on payment or review.
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-border bg-background p-5">
            <p className="text-sm text-muted">Paid Revenue</p>
            <div className="mt-3 text-3xl font-semibold">
              {formatCurrency(summary.metrics.paidRevenue)}
            </div>
            <p className="mt-2 text-sm text-muted">
              Captured from paid, processing, shipped, and completed orders.
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-border bg-background p-5">
            <p className="text-sm text-muted">Catalog Live</p>
            <div className="mt-3 text-3xl font-semibold">{summary.metrics.activeProducts}</div>
            <p className="mt-2 text-sm text-muted">
              {summary.metrics.activePromotions} active promotion(s) are currently available.
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-border bg-background p-5">
            <p className="text-sm text-muted">Urgent Alerts</p>
            <div className="mt-3 text-3xl font-semibold">{urgentAlertCount}</div>
            <p className="mt-2 text-sm text-muted">
              Payments, low stock, and missing config gaps that need admin attention.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <Link
          href="/admin/payments"
          className="rounded-[1.5rem] border border-border bg-surface p-5 transition hover:border-accent"
        >
          <p className="text-sm text-muted">Payment Review Queue</p>
          <div className="mt-3 text-3xl font-semibold">{summary.metrics.paymentReviewCount}</div>
          <p className="mt-2 text-sm text-muted">
            Manual transfer submissions waiting for admin confirmation or rejection.
          </p>
        </Link>
        <Link
          href="/admin/inventory"
          className="rounded-[1.5rem] border border-border bg-surface p-5 transition hover:border-accent"
        >
          <p className="text-sm text-muted">Low Stock Variants</p>
          <div className="mt-3 text-3xl font-semibold">{summary.metrics.lowStockCount}</div>
          <p className="mt-2 text-sm text-muted">
            Variants at or below threshold `5` that may block the next orders.
          </p>
        </Link>
        <Link
          href="/admin/settings"
          className="rounded-[1.5rem] border border-border bg-surface p-5 transition hover:border-accent"
        >
          <p className="text-sm text-muted">Missing Store Configs</p>
          <div className="mt-3 text-3xl font-semibold">{summary.metrics.missingConfigCount}</div>
          <p className="mt-2 text-sm text-muted">
            Missing config keys currently fall back to defaults until restored or saved.
          </p>
        </Link>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <section className="rounded-[1.5rem] border border-border bg-surface p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Recent Orders</h2>
                <p className="mt-2 text-sm text-muted">
                  Latest order placements across the current workspace.
                </p>
              </div>
              <Link
                href="/admin/orders"
                className="rounded-full border border-border px-4 py-2 text-sm text-muted transition hover:text-foreground"
              >
                All orders
              </Link>
            </div>

            {summary.recentOrders.length ? (
              <div className="mt-5 space-y-3">
                {summary.recentOrders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/admin/orders/${order.id}`}
                    className="block rounded-2xl border border-border bg-background px-4 py-4 transition hover:border-accent"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="font-medium">{order.orderNumber}</div>
                        <div className="mt-1 text-sm text-muted">
                          {formatDateTime(order.placedAt)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{formatCurrency(order.grandTotal)}</div>
                        <div className="mt-2 flex flex-wrap justify-end gap-2">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${statusBadgeClass(order.status)}`}
                          >
                            {order.status}
                          </span>
                          {order.paymentStatus ? (
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-medium ${statusBadgeClass(order.paymentStatus)}`}
                            >
                              {order.paymentStatus}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="mt-5">
                <DataState
                  eyebrow="Orders Empty"
                  title="No orders recorded yet"
                  description="Order placement flow is live, but there are still no orders in this database."
                  size="compact"
                />
              </div>
            )}
          </section>

          <section className="rounded-[1.5rem] border border-border bg-surface p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Recent Audit Activity</h2>
                <p className="mt-2 text-sm text-muted">
                  Latest operational events across admin, customer, and system actors.
                </p>
              </div>
              <Link
                href="/admin/audit"
                className="rounded-full border border-border px-4 py-2 text-sm text-muted transition hover:text-foreground"
              >
                Full audit
              </Link>
            </div>

            {summary.recentAuditEvents.length ? (
              <div className="mt-5 space-y-3">
                {summary.recentAuditEvents.map((event) => (
                  <Link
                    key={event.id}
                    href="/admin/audit"
                    className="block rounded-2xl border border-border bg-background px-4 py-4 transition hover:border-accent"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="font-medium">{event.action}</div>
                        <div className="mt-1 text-sm text-muted">{event.actorLabel}</div>
                      </div>
                      <div className="text-right text-sm text-muted">
                        <div>{event.entityType}</div>
                        <div className="mt-1">{formatDateTime(event.createdAt)}</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="mt-5">
                <DataState
                  eyebrow="Audit Empty"
                  title="No audit events yet"
                  description="Audit logging is wired, but there are no recorded events to display on the dashboard yet."
                  size="compact"
                />
              </div>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-[1.5rem] border border-border bg-surface p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Payment Queue</h2>
                <p className="mt-2 text-sm text-muted">
                  Most urgent payment submissions that still need manual review.
                </p>
              </div>
              <Link
                href="/admin/payments"
                className="rounded-full border border-border px-4 py-2 text-sm text-muted transition hover:text-foreground"
              >
                Review queue
              </Link>
            </div>

            {summary.paymentQueue.length ? (
              <div className="mt-5 space-y-3">
                {summary.paymentQueue.map((payment) => (
                  <Link
                    key={payment.id}
                    href="/admin/payments"
                    className="block rounded-2xl border border-border bg-background px-4 py-4 transition hover:border-accent"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="font-medium">{payment.order.orderNumber}</div>
                        <div className="mt-1 text-sm text-muted">
                          {payment.latestProof
                            ? `Latest proof: ${formatDateTime(payment.latestProof.uploadedAt)}`
                            : "No proof uploaded yet"}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{formatCurrency(payment.amount)}</div>
                        <span
                          className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusBadgeClass(payment.status)}`}
                        >
                          {payment.status}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="mt-5">
                <DataState
                  eyebrow="Queue Clear"
                  title="No payments waiting for review"
                  description="Manual transfer queue is currently empty."
                  size="compact"
                />
              </div>
            )}
          </section>

          <section className="rounded-[1.5rem] border border-border bg-surface p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Low Stock Watch</h2>
                <p className="mt-2 text-sm text-muted">
                  Variants closest to depletion based on the current threshold.
                </p>
              </div>
              <Link
                href="/admin/inventory"
                className="rounded-full border border-border px-4 py-2 text-sm text-muted transition hover:text-foreground"
              >
                Inventory
              </Link>
            </div>

            {summary.lowStockVariants.length ? (
              <div className="mt-5 space-y-3">
                {summary.lowStockVariants.map((variant) => (
                  <Link
                    key={variant.id}
                    href="/admin/inventory"
                    className="block rounded-2xl border border-border bg-background px-4 py-4 transition hover:border-accent"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-medium">{variant.product.name}</div>
                        <div className="mt-1 text-sm text-muted">{variant.variantLabel}</div>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          variant.stockOnHand === 0
                            ? "bg-red-100 text-red-700"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {variant.stockOnHand} unit(s)
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="mt-5">
                <DataState
                  eyebrow="Healthy"
                  title="No low stock alerts"
                  description="All active variants are currently above the operational low-stock threshold."
                  size="compact"
                />
              </div>
            )}
          </section>
        </div>
      </section>
    </div>
  );
}
