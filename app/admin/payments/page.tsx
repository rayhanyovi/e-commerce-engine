import Link from "next/link";

import { AdminPaymentReviewForm } from "@/components/admin/admin-payment-review-form";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { PaymentStatusBadge } from "@/components/orders/payment-status-badge";
import { DataState } from "@/components/ui/data-state";
import { formatCurrency, formatDateTime } from "@/lib/formatters";
import { toFlatSearchParams, type SearchParamInput } from "@/lib/search-params";
import { listAdminPaymentReviewQueue } from "@/server/payments";
import { PaymentReviewQueueQuerySchema } from "@/shared/contracts";

export const dynamic = "force-dynamic";

function buildAdminPaymentsHref(
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

  return query ? `/admin/payments?${query}` : "/admin/payments";
}

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamInput>;
}) {
  const currentSearchParams = toFlatSearchParams(await searchParams);
  const query = PaymentReviewQueueQuerySchema.parse(currentSearchParams);
  const result = await listAdminPaymentReviewQueue(query);
  const totalPages = Math.max(1, Math.ceil(result.total / query.pageSize));
  const hasActiveFilters = Boolean(query.status);

  return (
    <div className="space-y-8">
      <section className="rounded-[1.75rem] border border-border bg-surface p-6 lg:p-8">
        <p className="text-sm uppercase tracking-[0.18em] text-muted">Admin Payments</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">
          Manual transfer review queue is now live
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
          Batch ini masih mock manual transfer, tapi queue review, confirm, reject, dan sinkronisasi
          ke status order sekarang sudah jalan dari root Next app.
        </p>
      </section>

      <form className="grid gap-4 rounded-[1.5rem] border border-border bg-surface p-5 md:grid-cols-[0.8fr_auto]">
        <select
          name="status"
          defaultValue={query.status ?? ""}
          className="w-full rounded-2xl border border-border bg-background px-4 py-3 outline-none transition focus:border-accent"
        >
          <option value="">Submitted + Under Review</option>
          <option value="SUBMITTED">Submitted only</option>
          <option value="UNDER_REVIEW">Under review only</option>
        </select>
        <div className="flex gap-3">
          <input type="hidden" name="page" value="1" />
          <input type="hidden" name="pageSize" value={String(query.pageSize)} />
          <button className="rounded-full bg-accent px-5 py-3 text-sm font-medium text-white">
            Filter
          </button>
          <Link
            href="/admin/payments"
            className="rounded-full border border-border px-5 py-3 text-sm font-medium text-muted transition hover:text-foreground"
          >
            Reset
          </Link>
        </div>
      </form>

      {!result.payments.length ? (
        <DataState
          eyebrow={hasActiveFilters ? "No Matches" : "Queue Empty"}
          title={
            hasActiveFilters
              ? "No payments matched this queue filter"
              : "No payment proofs are waiting for review"
          }
          description={
            hasActiveFilters
              ? "Try a different payment status filter or reset the queue view."
              : "Manual transfer review is connected, but there are no submitted proofs waiting in the admin queue right now."
          }
          size="compact"
          actions={
            hasActiveFilters
              ? [{ href: "/admin/payments", label: "Reset filters", variant: "secondary" }]
              : undefined
          }
        />
      ) : (
        <section className="space-y-4">
          {result.payments.map((payment) => (
            <div
              key={payment.id}
              data-testid={`payment-card-${payment.order.orderNumber}`}
              className="rounded-[1.5rem] border border-border bg-surface p-5"
            >
              <div className="flex flex-col gap-6 xl:grid xl:grid-cols-[1.1fr_0.9fr]">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl font-semibold">{payment.order.orderNumber}</h2>
                    <PaymentStatusBadge status={payment.status} />
                    <OrderStatusBadge status={payment.order.status} />
                  </div>

                  <div className="grid gap-2 text-sm text-muted">
                    <p>Placed {formatDateTime(payment.order.placedAt)}</p>
                    <p>Amount {formatCurrency(payment.amount, payment.order.currency)}</p>
                    <p>Method {payment.method}</p>
                    <p>
                      Submitted{" "}
                      {payment.submittedAt
                        ? formatDateTime(payment.submittedAt)
                        : "not recorded yet"}
                    </p>
                  </div>

                  <div className="space-y-3">
                    {payment.proofs.map((proof) => (
                      <div
                        key={proof.id}
                        className="rounded-2xl border border-border bg-background px-4 py-4 text-sm text-muted"
                      >
                        <p className="font-medium text-foreground">
                          {proof.fileName || proof.filePath}
                        </p>
                        <p className="mt-2 break-all">{proof.filePath}</p>
                        <p className="mt-1">Uploaded {formatDateTime(proof.uploadedAt)}</p>
                        {proof.uploadedBy ? (
                          <p className="mt-1">
                            By {proof.uploadedBy.name} ({proof.uploadedBy.email})
                          </p>
                        ) : null}
                        {proof.mimeType ? <p className="mt-1">Type: {proof.mimeType}</p> : null}
                        {proof.fileSize ? (
                          <p className="mt-1">
                            Size: {proof.fileSize.toLocaleString("id-ID")} bytes
                          </p>
                        ) : null}
                        {proof.note ? <p className="mt-1">Note: {proof.note}</p> : null}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-2xl border border-border bg-background px-4 py-4 text-sm text-muted">
                    <p className="font-medium text-foreground">Queue Summary</p>
                    <p className="mt-2">Proof count: {payment.proofCount}</p>
                    <p className="mt-1">
                      Latest proof:{" "}
                      {payment.latestProof
                        ? formatDateTime(payment.latestProof.uploadedAt)
                        : "No proof"}
                    </p>
                  </div>

                  <AdminPaymentReviewForm
                    paymentId={payment.id}
                    currentStatus={payment.status}
                  />
                </div>
              </div>
            </div>
          ))}
        </section>
      )}

      {totalPages > 1 ? (
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href={buildAdminPaymentsHref(currentSearchParams, {
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
            href={buildAdminPaymentsHref(currentSearchParams, {
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
