import Link from "next/link";

import { DataState } from "@/components/ui/data-state";
import { formatCurrency } from "@/lib/formatters";
import { toFlatSearchParams, type SearchParamInput } from "@/lib/search-params";
import { toUserFacingErrorMessage } from "@/lib/user-facing-error";
import { listAdminCategories, listAdminProducts } from "@/server/catalog";
import { ProductListQuerySchema } from "@/shared/contracts";

export const dynamic = "force-dynamic";

function buildCatalogHref(
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

  return query ? `/admin/catalog?${query}` : "/admin/catalog";
}

function formatPriceRange(priceRange: { min: number; max: number }) {
  if (priceRange.min === priceRange.max) {
    return formatCurrency(priceRange.min);
  }

  return `${formatCurrency(priceRange.min)} - ${formatCurrency(priceRange.max)}`;
}

export default async function AdminCatalogPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamInput>;
}) {
  const currentSearchParams = toFlatSearchParams(await searchParams);
  const query = ProductListQuerySchema.parse(currentSearchParams);
  let categories: Awaited<ReturnType<typeof listAdminCategories>> | null = null;
  let result: Awaited<ReturnType<typeof listAdminProducts>> | null = null;
  let errorMessage: string | null = null;

  try {
    [categories, result] = await Promise.all([
      listAdminCategories(),
      listAdminProducts(query),
    ]);
  } catch (error) {
    errorMessage = toUserFacingErrorMessage(
      error,
      "Admin catalog data could not be loaded right now. Try again after the database setup is ready.",
    );
  }

  if (!categories || !result) {
    return (
      <DataState
        tone="error"
        eyebrow="Catalog Error"
        title="Admin catalog is not available"
        description={
          errorMessage ??
          "Admin catalog data could not be loaded right now. Try again after the database setup is ready."
        }
        actions={[
          { href: "/admin/catalog", label: "Reload admin catalog" },
          { href: "/admin", label: "Back to admin", variant: "secondary" },
        ]}
      />
    );
  }

  const activeProductsOnPage = result.products.filter((product) => product.isActive).length;
  const totalPages = Math.max(1, Math.ceil(result.total / query.pageSize));
  const hasActiveFilters = Boolean(query.search || query.category);

  return (
    <div className="space-y-8">
      <section className="grid gap-4 xl:grid-cols-3">
        <div className="rounded-[1.5rem] border border-border bg-surface p-5">
          <p className="text-sm text-muted">Categories</p>
          <div className="mt-3 text-3xl font-semibold">{categories.length}</div>
          <p className="mt-2 text-sm text-muted">
            Public dan admin category list sekarang sudah dibaca dari catalog module baru.
          </p>
        </div>
        <div className="rounded-[1.5rem] border border-border bg-surface p-5">
          <p className="text-sm text-muted">Products</p>
          <div className="mt-3 text-3xl font-semibold">{result.total}</div>
          <p className="mt-2 text-sm text-muted">
            Admin product list sekarang tidak lagi placeholder seperti source lama.
          </p>
        </div>
        <div className="rounded-[1.5rem] border border-border bg-surface p-5">
          <p className="text-sm text-muted">Active On Page</p>
          <div className="mt-3 text-3xl font-semibold">{activeProductsOnPage}</div>
          <p className="mt-2 text-sm text-muted">
            Product create, edit, dan delete sekarang sudah terhubung ke admin product editor.
          </p>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[1.5rem] border border-border bg-surface p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Categories</h2>
            <span className="text-sm text-muted">CRUD API ready</span>
          </div>
          <div className="mt-4 space-y-3">
            {categories.length ? (
              categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between rounded-2xl border border-border bg-background px-4 py-3"
                >
                  <div>
                    <div className="font-medium">{category.name}</div>
                    <div className="text-sm text-muted">{category.slug}</div>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs ${
                      category.isActive
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {category.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              ))
            ) : (
              <DataState
                eyebrow="Empty"
                title="No categories yet"
                description="The admin catalog is connected, but there are no categories saved in the database yet."
                size="compact"
              />
            )}
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-border bg-surface p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Products</h2>
              <p className="mt-2 text-sm text-muted">
                Search, filter, pagination, dan admin visibility sekarang sudah wired.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/admin/products/create"
                className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-white"
              >
                Create Product
              </Link>
              <Link
                href="/api/admin/products"
                className="rounded-full border border-border px-4 py-2 text-sm text-muted transition hover:text-foreground"
              >
                Inspect API
              </Link>
            </div>
          </div>

          <form className="mt-5 grid gap-4 md:grid-cols-[1.3fr_0.8fr_0.8fr_auto]">
            <input
              name="search"
              defaultValue={query.search ?? ""}
              placeholder="Search name, slug, description..."
              className="w-full rounded-2xl border border-border bg-background px-4 py-3 outline-none transition focus:border-accent"
            />
            <select
              name="category"
              defaultValue={query.category ?? ""}
              className="w-full rounded-2xl border border-border bg-background px-4 py-3 outline-none transition focus:border-accent"
            >
              <option value="">All categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
            <select
              name="sort"
              defaultValue={query.sort}
              className="w-full rounded-2xl border border-border bg-background px-4 py-3 outline-none transition focus:border-accent"
            >
              <option value="newest">Newest</option>
              <option value="price_asc">Price low-high</option>
              <option value="price_desc">Price high-low</option>
              <option value="name_asc">Name A-Z</option>
            </select>
            <div className="flex gap-3">
              <input type="hidden" name="page" value="1" />
              <input type="hidden" name="pageSize" value={String(query.pageSize)} />
              <button className="rounded-full bg-accent px-5 py-3 text-sm font-medium text-white">
                Filter
              </button>
              <Link
                href="/admin/catalog"
                className="rounded-full border border-border px-5 py-3 text-sm font-medium text-muted transition hover:text-foreground"
              >
                Reset
              </Link>
            </div>
          </form>

          {result.products.length ? (
            <div className="mt-5 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-muted">
                  <tr>
                    <th className="pb-3 pr-4 font-medium">Product</th>
                    <th className="pb-3 pr-4 font-medium">Category</th>
                    <th className="pb-3 pr-4 font-medium">Price</th>
                    <th className="pb-3 pr-4 font-medium">Variants</th>
                    <th className="pb-3 pr-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {result.products.map((product) => (
                    <tr key={product.id} className="border-t border-border">
                      <td className="py-3 pr-4">
                        <div className="font-medium">{product.name}</div>
                        <div className="text-xs text-muted">{product.slug}</div>
                      </td>
                      <td className="py-3 pr-4">{product.category.name}</td>
                      <td className="py-3 pr-4">{formatPriceRange(product.priceRange)}</td>
                      <td className="py-3 pr-4">{product._count.variants}</td>
                      <td className="py-3 pr-4">
                        <div className="flex flex-wrap items-center gap-3">
                          <span
                            className={`rounded-full px-3 py-1 text-xs ${
                              product.isActive
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-slate-200 text-slate-700"
                            }`}
                          >
                            {product.isActive ? "Active" : "Inactive"}
                          </span>
                          <Link
                            href={`/admin/products/${product.id}`}
                            className="text-xs font-medium text-accent transition hover:text-accent-strong"
                          >
                            Edit
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="mt-5">
              <DataState
                eyebrow={hasActiveFilters ? "No Matches" : "Catalog Empty"}
                title={hasActiveFilters ? "No products matched this admin query" : "No products have been added yet"}
                description={
                  hasActiveFilters
                    ? "Adjust or clear the current filters to inspect a broader product set."
                    : "The admin catalog is connected, but there are still no products stored in the database."
                }
                size="compact"
                actions={
                  hasActiveFilters
                    ? [{ href: "/admin/catalog", label: "Clear filters", variant: "secondary" }]
                    : undefined
                }
              />
            </div>
          )}

          {totalPages > 1 ? (
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <Link
                href={buildCatalogHref(currentSearchParams, {
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
                href={buildCatalogHref(currentSearchParams, {
                  page:
                    query.page < totalPages ? String(query.page + 1) : String(totalPages),
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
