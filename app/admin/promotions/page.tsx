import Link from "next/link";

import { PromotionForm } from "@/components/admin/promotion-form";
import { DataState } from "@/components/ui/data-state";
import { formatCurrency, formatDateTime } from "@/lib/formatters";
import { toFlatSearchParams, type SearchParamInput } from "@/lib/search-params";
import { listAdminPromotions } from "@/server/promotions";
import { PromotionListQuerySchema } from "@/shared/contracts";

export const dynamic = "force-dynamic";

function buildPromotionsHref(
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

  return query ? `/admin/promotions?${query}` : "/admin/promotions";
}

export default async function AdminPromotionsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamInput>;
}) {
  const currentSearchParams = toFlatSearchParams(await searchParams);
  const query = PromotionListQuerySchema.parse(currentSearchParams);
  const result = await listAdminPromotions(query);
  const totalPages = Math.max(1, Math.ceil(result.total / query.pageSize));
  const activePromotions = result.promotions.filter((promotion) => promotion.isActive).length;
  const hasActiveFilters = Boolean(query.search || query.type || query.status);

  return (
    <div className="space-y-8">
      <section className="grid gap-4 xl:grid-cols-3">
        <div className="rounded-[1.5rem] border border-border bg-surface p-5">
          <p className="text-sm text-muted">Total Promotions</p>
          <div className="mt-3 text-3xl font-semibold">{result.total}</div>
          <p className="mt-2 text-sm text-muted">
            CRUD admin sekarang hidup langsung di root Next app.
          </p>
        </div>
        <div className="rounded-[1.5rem] border border-border bg-surface p-5">
          <p className="text-sm text-muted">Active On Page</p>
          <div className="mt-3 text-3xl font-semibold">{activePromotions}</div>
          <p className="mt-2 text-sm text-muted">
            Filter status dan type sekarang membaca query server-side.
          </p>
        </div>
        <div className="rounded-[1.5rem] border border-border bg-surface p-5">
          <p className="text-sm text-muted">Usage Tracked</p>
          <div className="mt-3 text-3xl font-semibold">
            {result.promotions.reduce((sum, promotion) => sum + promotion.usageCount, 0)}
          </div>
          <p className="mt-2 text-sm text-muted">
            Promotion usage dan totalUsed sudah ikut naik saat order sukses.
          </p>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <PromotionForm mode="create" />

        <div className="space-y-5">
          <section className="rounded-[1.5rem] border border-border bg-surface p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Promotion Registry</h2>
                <p className="mt-2 text-sm text-muted">
                  Update scopes sekarang benar-benar sinkron, bukan cuma update field utama.
                </p>
              </div>
              <Link
                href="/api/admin/promotions"
                className="rounded-full border border-border px-4 py-2 text-sm text-muted transition hover:text-foreground"
              >
                Inspect API
              </Link>
            </div>

            <form className="mt-5 grid gap-4 md:grid-cols-[1.2fr_0.8fr_0.8fr_auto]">
              <input
                name="search"
                defaultValue={query.search ?? ""}
                placeholder="Search code or target ID..."
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 outline-none transition focus:border-accent"
              />
              <select
                name="type"
                defaultValue={query.type ?? ""}
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 outline-none transition focus:border-accent"
              >
                <option value="">All types</option>
                <option value="PERCENTAGE">Percentage</option>
                <option value="FIXED_AMOUNT">Fixed Amount</option>
                <option value="FREE_SHIPPING">Free Shipping</option>
                <option value="FREE_PRODUCT">Free Product</option>
              </select>
              <select
                name="status"
                defaultValue={query.status ?? ""}
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 outline-none transition focus:border-accent"
              >
                <option value="">All statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <div className="flex gap-3">
                <input type="hidden" name="page" value="1" />
                <input type="hidden" name="pageSize" value={String(query.pageSize)} />
                <button className="rounded-full bg-accent px-5 py-3 text-sm font-medium text-white">
                  Filter
                </button>
                <Link
                  href="/admin/promotions"
                  className="rounded-full border border-border px-5 py-3 text-sm font-medium text-muted transition hover:text-foreground"
                >
                  Reset
                </Link>
              </div>
            </form>
          </section>

          {!result.promotions.length ? (
            <DataState
              eyebrow={hasActiveFilters ? "No Matches" : "Promotions Empty"}
              title={
                hasActiveFilters
                  ? "No promotions matched the current filters"
                  : "No promotions have been created yet"
              }
              description={
                hasActiveFilters
                  ? "Adjust the search, type, or status filters to widen the promotion registry query."
                  : "Create the first promotion from this page to activate voucher and discount rules in the engine."
              }
              size="compact"
              actions={
                hasActiveFilters
                  ? [{ href: "/admin/promotions", label: "Reset filters", variant: "secondary" }]
                  : undefined
              }
            />
          ) : (
            <section className="space-y-4">
              {result.promotions.map((promotion) => (
                <div
                  key={promotion.id}
                  className="rounded-[1.5rem] border border-border bg-surface p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-xl font-semibold">
                          {promotion.code || "NO-CODE PROMOTION"}
                        </h2>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            promotion.isActive
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {promotion.isActive ? "Active" : "Inactive"}
                        </span>
                        <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-medium text-sky-800">
                          {promotion.type}
                        </span>
                        {promotion.isStackable ? (
                          <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-medium text-violet-800">
                            Stackable
                          </span>
                        ) : null}
                      </div>
                      <div className="mt-3 grid gap-2 text-sm text-muted">
                        <p>
                          Value{" "}
                          {promotion.type === "PERCENTAGE"
                            ? `${promotion.value}%`
                            : formatCurrency(promotion.value)}
                        </p>
                        <p>
                          Valid {formatDateTime(promotion.validFrom)} -{" "}
                          {formatDateTime(promotion.validUntil)}
                        </p>
                        <p>
                          Usage {promotion.totalUsed}
                          {promotion.totalUsageLimit != null
                            ? ` / ${promotion.totalUsageLimit}`
                            : " / unlimited"}
                        </p>
                        <p>
                          Per-user limit{" "}
                          {promotion.perUserUsageLimit != null
                            ? promotion.perUserUsageLimit
                            : "unlimited"}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-border bg-background px-4 py-4 text-sm text-muted">
                      <p className="font-medium text-foreground">Scopes</p>
                      <div className="mt-2 space-y-2">
                        {promotion.scopes.map((scope) => (
                          <p key={scope.id}>
                            {scope.scopeType}
                            {scope.targetId ? ` · ${scope.targetId}` : ""}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5">
                    <PromotionForm
                      mode="edit"
                      promotion={{
                        id: promotion.id,
                        code: promotion.code,
                        type: promotion.type,
                        value: promotion.value,
                        minPurchase: promotion.minPurchase,
                        maxDiscountCap: promotion.maxDiscountCap,
                        validFrom: promotion.validFrom.toISOString(),
                        validUntil: promotion.validUntil.toISOString(),
                        totalUsageLimit: promotion.totalUsageLimit,
                        perUserUsageLimit: promotion.perUserUsageLimit,
                        isActive: promotion.isActive,
                        isStackable: promotion.isStackable,
                        scopes: promotion.scopes.map((scope) => ({
                          id: scope.id,
                          scopeType: scope.scopeType,
                          targetId: scope.targetId,
                        })),
                        usageCount: promotion.usageCount,
                      }}
                    />
                  </div>
                </div>
              ))}
            </section>
          )}

          {totalPages > 1 ? (
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href={buildPromotionsHref(currentSearchParams, {
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
                href={buildPromotionsHref(currentSearchParams, {
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
      </section>
    </div>
  );
}
