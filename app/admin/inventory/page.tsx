import Link from "next/link";

import { InventoryAdjustmentForm } from "@/components/admin/inventory-adjustment-form";
import { formatDateTime } from "@/lib/formatters";
import { getSingleSearchParamValue, type SearchParamInput } from "@/lib/search-params";
import { listLowStockVariants, listStockMovements } from "@/server/inventory";
import {
  LowStockQuerySchema,
  StockMovementsQuerySchema,
} from "@/shared/contracts";

export const dynamic = "force-dynamic";

function buildInventoryHref(
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

  return query ? `/admin/inventory?${query}` : "/admin/inventory";
}

export default async function AdminInventoryPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamInput>;
}) {
  const rawSearchParams = await searchParams;
  const currentSearchParams = Object.fromEntries(
    Object.entries(rawSearchParams).map(([key, value]) => [
      key,
      getSingleSearchParamValue(value),
    ]),
  );
  const movementQuery = StockMovementsQuerySchema.parse({
    page: currentSearchParams.page ?? "1",
    pageSize: currentSearchParams.pageSize ?? "10",
    type: currentSearchParams.type,
    productVariantId: currentSearchParams.productVariantId,
  });
  const lowStockQuery = LowStockQuerySchema.parse({
    page: currentSearchParams.lowStockPage ?? "1",
    pageSize: currentSearchParams.lowStockPageSize ?? "10",
    threshold: currentSearchParams.threshold ?? "5",
  });
  let movementsResult: Awaited<ReturnType<typeof listStockMovements>> | null = null;
  let lowStockResult: Awaited<ReturnType<typeof listLowStockVariants>> | null = null;
  let errorMessage: string | null = null;

  try {
    [movementsResult, lowStockResult] = await Promise.all([
      listStockMovements(movementQuery),
      listLowStockVariants(lowStockQuery),
    ]);
  } catch (error) {
    errorMessage =
      error instanceof Error
        ? error.message
        : "Inventory query failed. Check database configuration and seed state.";
  }

  if (!movementsResult || !lowStockResult) {
    return (
      <section className="rounded-[1.75rem] border border-border bg-surface p-8">
        <p className="text-sm uppercase tracking-[0.18em] text-muted">Inventory Error</p>
        <h1 className="mt-4 text-3xl font-semibold">Inventory page is not available</h1>
        <p className="mt-4 text-sm leading-7 text-muted">{errorMessage}</p>
      </section>
    );
  }

  const movementTotalPages = Math.max(
    1,
    Math.ceil(movementsResult.total / movementQuery.pageSize),
  );
  const lowStockTotalPages = Math.max(
    1,
    Math.ceil(lowStockResult.total / lowStockQuery.pageSize),
  );

  return (
    <div className="space-y-8">
      <section className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <InventoryAdjustmentForm />

        <div className="rounded-[1.5rem] border border-border bg-surface p-5">
          <p className="text-sm uppercase tracking-[0.18em] text-muted">Inventory Snapshot</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-border bg-background p-4">
              <div className="text-sm text-muted">Movement Events</div>
              <div className="mt-3 text-3xl font-semibold">{movementsResult.total}</div>
            </div>
            <div className="rounded-2xl border border-border bg-background p-4">
              <div className="text-sm text-muted">Low Stock Variants</div>
              <div className="mt-3 text-3xl font-semibold">{lowStockResult.total}</div>
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-muted">
            Route ini sekarang baca movement log dan low-stock list langsung dari inventory module
            baru. Order reserve/release/consume akan ikut hidup saat orders domain dipindahkan.
          </p>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-[1.5rem] border border-border bg-surface p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Stock Movements</h2>
              <p className="mt-2 text-sm text-muted">Adjustment dan mutation log terbaru.</p>
            </div>
            <Link
              href="/api/admin/inventory/movements"
              className="rounded-full border border-border px-4 py-2 text-sm text-muted transition hover:text-foreground"
            >
              API
            </Link>
          </div>

          <form className="mt-5 grid gap-4 md:grid-cols-[1fr_1fr_auto]">
            <input
              name="productVariantId"
              defaultValue={movementQuery.productVariantId ?? ""}
              placeholder="Variant ID filter"
              className="w-full rounded-2xl border border-border bg-background px-4 py-3 outline-none transition focus:border-accent"
            />
            <select
              name="type"
              defaultValue={movementQuery.type ?? ""}
              className="w-full rounded-2xl border border-border bg-background px-4 py-3 outline-none transition focus:border-accent"
            >
              <option value="">All movement types</option>
              <option value="ADJUSTMENT_IN">Stock In</option>
              <option value="ADJUSTMENT_OUT">Stock Out</option>
              <option value="ORDER_RESERVE">Order Reserve</option>
              <option value="ORDER_CANCEL_RELEASE">Cancel Release</option>
              <option value="ORDER_CONSUME">Order Consume</option>
              <option value="INITIAL_STOCK">Initial Stock</option>
            </select>
            <div className="flex gap-3">
              <input type="hidden" name="page" value="1" />
              <input type="hidden" name="pageSize" value={String(movementQuery.pageSize)} />
              <input type="hidden" name="lowStockPage" value={String(lowStockQuery.page)} />
              <input
                type="hidden"
                name="lowStockPageSize"
                value={String(lowStockQuery.pageSize)}
              />
              <input type="hidden" name="threshold" value={String(lowStockQuery.threshold)} />
              <button className="rounded-full bg-accent px-5 py-3 text-sm font-medium text-white">
                Filter
              </button>
              <Link
                href="/admin/inventory"
                className="rounded-full border border-border px-5 py-3 text-sm font-medium text-muted transition hover:text-foreground"
              >
                Reset
              </Link>
            </div>
          </form>

          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-muted">
                <tr>
                  <th className="pb-3 pr-4 font-medium">Date</th>
                  <th className="pb-3 pr-4 font-medium">Variant</th>
                  <th className="pb-3 pr-4 font-medium">Type</th>
                  <th className="pb-3 pr-4 font-medium">Qty</th>
                </tr>
              </thead>
              <tbody>
                {movementsResult.movements.map((movement) => (
                  <tr key={movement.id} className="border-t border-border">
                    <td className="py-3 pr-4 text-muted">{formatDateTime(movement.createdAt)}</td>
                    <td className="py-3 pr-4">
                      <div className="font-medium">{movement.variant.product.name}</div>
                      <div className="text-xs text-muted">{movement.variantLabel}</div>
                      <div className="text-xs text-muted">ID: {movement.productVariantId}</div>
                    </td>
                    <td className="py-3 pr-4">{movement.movementLabel}</td>
                    <td className="py-3 pr-4">
                      <span className={movement.qty > 0 ? "text-emerald-700" : "text-red-700"}>
                        {movement.qty > 0 ? "+" : ""}
                        {movement.qty}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {movementTotalPages > 1 ? (
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <Link
                href={buildInventoryHref(currentSearchParams, {
                  page: movementQuery.page > 1 ? String(movementQuery.page - 1) : "1",
                })}
                className={`rounded-full border px-5 py-3 text-sm font-medium transition ${
                  movementQuery.page === 1
                    ? "pointer-events-none border-border text-muted/50"
                    : "border-border text-muted hover:text-foreground"
                }`}
              >
                Previous
              </Link>
              <span className="text-sm text-muted">
                Page {movementQuery.page} of {movementTotalPages}
              </span>
              <Link
                href={buildInventoryHref(currentSearchParams, {
                  page:
                    movementQuery.page < movementTotalPages
                      ? String(movementQuery.page + 1)
                      : String(movementTotalPages),
                })}
                className={`rounded-full border px-5 py-3 text-sm font-medium transition ${
                  movementQuery.page >= movementTotalPages
                    ? "pointer-events-none border-border text-muted/50"
                    : "border-border text-muted hover:text-foreground"
                }`}
              >
                Next
              </Link>
            </div>
          ) : null}
        </div>

        <div className="rounded-[1.5rem] border border-border bg-surface p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Low Stock Variants</h2>
              <p className="mt-2 text-sm text-muted">
                Active variants with stock at or below the selected threshold.
              </p>
            </div>
            <Link
              href="/api/admin/inventory/low-stock"
              className="rounded-full border border-border px-4 py-2 text-sm text-muted transition hover:text-foreground"
            >
              API
            </Link>
          </div>

          <form className="mt-5 flex flex-wrap items-center gap-3">
            <label className="text-sm font-medium">
              Threshold
              <input
                name="threshold"
                type="number"
                min="0"
                defaultValue={String(lowStockQuery.threshold)}
                className="ml-3 w-24 rounded-2xl border border-border bg-background px-4 py-3 outline-none transition focus:border-accent"
              />
            </label>
            <input type="hidden" name="page" value={String(movementQuery.page)} />
            <input type="hidden" name="pageSize" value={String(movementQuery.pageSize)} />
            <input type="hidden" name="type" value={movementQuery.type ?? ""} />
            <input
              type="hidden"
              name="productVariantId"
              value={movementQuery.productVariantId ?? ""}
            />
            <input type="hidden" name="lowStockPage" value="1" />
            <input
              type="hidden"
              name="lowStockPageSize"
              value={String(lowStockQuery.pageSize)}
            />
            <button className="rounded-full bg-accent px-5 py-3 text-sm font-medium text-white">
              Apply
            </button>
          </form>

          <div className="mt-5 space-y-3">
            {lowStockResult.variants.map((variant) => (
              <div
                key={variant.id}
                className="rounded-2xl border border-border bg-background px-4 py-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-medium">{variant.product.name}</div>
                    <div className="mt-1 text-sm text-muted">{variant.variantLabel}</div>
                    <div className="mt-1 text-xs text-muted">Variant ID: {variant.id}</div>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs ${
                      variant.stockOnHand === 0
                        ? "bg-red-100 text-red-700"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {variant.stockOnHand} unit(s)
                  </span>
                </div>
              </div>
            ))}
          </div>

          {lowStockTotalPages > 1 ? (
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <Link
                href={buildInventoryHref(currentSearchParams, {
                  lowStockPage: lowStockQuery.page > 1 ? String(lowStockQuery.page - 1) : "1",
                })}
                className={`rounded-full border px-5 py-3 text-sm font-medium transition ${
                  lowStockQuery.page === 1
                    ? "pointer-events-none border-border text-muted/50"
                    : "border-border text-muted hover:text-foreground"
                }`}
              >
                Previous
              </Link>
              <span className="text-sm text-muted">
                Page {lowStockQuery.page} of {lowStockTotalPages}
              </span>
              <Link
                href={buildInventoryHref(currentSearchParams, {
                  lowStockPage:
                    lowStockQuery.page < lowStockTotalPages
                      ? String(lowStockQuery.page + 1)
                      : String(lowStockTotalPages),
                })}
                className={`rounded-full border px-5 py-3 text-sm font-medium transition ${
                  lowStockQuery.page >= lowStockTotalPages
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
