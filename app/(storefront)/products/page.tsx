import Link from "next/link";

import { DataState } from "@/components/ui/data-state";
import { formatCurrency } from "@/lib/formatters";
import { toFlatSearchParams, type SearchParamInput } from "@/lib/search-params";
import { toUserFacingErrorMessage } from "@/lib/user-facing-error";
import { listProducts, listPublicCategories } from "@/server/catalog";
import { ProductListQuerySchema } from "@/shared/contracts";

export const dynamic = "force-dynamic";

function buildProductsHref(
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

  return query ? `/products?${query}` : "/products";
}

function formatPriceRange(priceRange: { min: number; max: number }) {
  if (priceRange.min === priceRange.max) {
    return formatCurrency(priceRange.min);
  }

  return `${formatCurrency(priceRange.min)} - ${formatCurrency(priceRange.max)}`;
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamInput>;
}) {
  const currentSearchParams = toFlatSearchParams(await searchParams);
  const query = ProductListQuerySchema.parse(currentSearchParams);
  let errorMessage: string | null = null;
  let result: Awaited<ReturnType<typeof listProducts>> | null = null;
  let categories: Awaited<ReturnType<typeof listPublicCategories>> | null = null;

  try {
    [result, categories] = await Promise.all([
      listProducts(query),
      listPublicCategories(),
    ]);
  } catch (error) {
    errorMessage = toUserFacingErrorMessage(
      error,
      "Catalog data could not be loaded right now. Try again after the database setup is ready.",
    );
  }

  if (!result || !categories) {
    return (
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-10 lg:px-10">
        <DataState
          tone="error"
          eyebrow="Catalog Error"
          title="Products are not available yet"
          description={
            errorMessage ??
            "Catalog data could not be loaded right now. Try again after the database setup is ready."
          }
          actions={[
            { href: "/products", label: "Reload catalog" },
            { href: "/", label: "Back to home", variant: "secondary" },
          ]}
        />
      </main>
    );
  }

  const totalPages = Math.max(1, Math.ceil(result.total / query.pageSize));
  const hasActiveFilters = Boolean(
    query.search || query.category || query.minPrice != null || query.maxPrice != null,
  );
  const isEmptyCatalog = !hasActiveFilters && categories.length === 0 && result.total === 0;

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10 lg:px-10">
      <section className="grid gap-5 rounded-[2rem] border border-border bg-surface p-6 lg:grid-cols-[1.1fr_0.9fr] lg:p-8">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-muted">Live Catalog</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">Products</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
            Public listing sekarang membaca catalog module di root Next app dengan query params
            yang setara dengan source lama: search, category filter, sort, pagination, dan price
            filter.
          </p>
        </div>

        <form className="grid gap-4 rounded-[1.5rem] border border-border bg-background p-5">
          <label className="text-sm font-medium">
            Search
            <input
              name="search"
              defaultValue={query.search ?? ""}
              placeholder="Search products..."
              className="mt-2 w-full rounded-2xl border border-border bg-surface px-4 py-3 outline-none transition focus:border-accent"
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-medium">
              Category
              <select
                name="category"
                defaultValue={query.category ?? ""}
                className="mt-2 w-full rounded-2xl border border-border bg-surface px-4 py-3 outline-none transition focus:border-accent"
              >
                <option value="">All categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm font-medium">
              Sort
              <select
                name="sort"
                defaultValue={query.sort}
                className="mt-2 w-full rounded-2xl border border-border bg-surface px-4 py-3 outline-none transition focus:border-accent"
              >
                <option value="newest">Newest</option>
                <option value="price_asc">Price: low to high</option>
                <option value="price_desc">Price: high to low</option>
                <option value="name_asc">Name A-Z</option>
              </select>
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-medium">
              Min Price
              <input
                name="minPrice"
                type="number"
                min="0"
                defaultValue={query.minPrice ?? ""}
                placeholder="0"
                className="mt-2 w-full rounded-2xl border border-border bg-surface px-4 py-3 outline-none transition focus:border-accent"
              />
            </label>

            <label className="text-sm font-medium">
              Max Price
              <input
                name="maxPrice"
                type="number"
                min="0"
                defaultValue={query.maxPrice ?? ""}
                placeholder="1000000"
                className="mt-2 w-full rounded-2xl border border-border bg-surface px-4 py-3 outline-none transition focus:border-accent"
              />
            </label>
          </div>

          <input type="hidden" name="page" value="1" />
          <input type="hidden" name="pageSize" value={String(query.pageSize)} />

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              className="rounded-full bg-accent px-5 py-3 text-sm font-medium text-white"
            >
              Apply Filters
            </button>
            <Link
              href="/products"
              className="rounded-full border border-border px-5 py-3 text-sm font-medium text-muted transition hover:text-foreground"
            >
              Reset
            </Link>
          </div>
        </form>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <span className="rounded-full border border-border px-4 py-2 text-sm text-muted">
          {result.total} product(s)
        </span>
        {query.category ? (
          <span className="rounded-full border border-border px-4 py-2 text-sm text-muted">
            Category: {query.category}
          </span>
        ) : null}
        {query.search ? (
          <span className="rounded-full border border-border px-4 py-2 text-sm text-muted">
            Search: {query.search}
          </span>
        ) : null}
      </div>

      {!result.products.length ? (
        <DataState
          eyebrow={isEmptyCatalog ? "Catalog Empty" : "No Matches"}
          title={isEmptyCatalog ? "Catalog data is still empty" : "No products matched these filters"}
          description={
            isEmptyCatalog
              ? "There are no published categories or products yet. Run the seed, or start adding catalog data from the admin side."
              : "Adjust the current filters or clear them to load a broader catalog result."
          }
          actions={
            hasActiveFilters
              ? [
                  { href: "/products", label: "Clear filters" },
                  { href: "/", label: "Back to home", variant: "secondary" },
                ]
              : [{ href: "/", label: "Back to home", variant: "secondary" }]
          }
        />
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {result.products.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              className="rounded-[1.5rem] border border-border bg-surface p-5 transition hover:border-accent"
            >
              <div className="rounded-[1.25rem] border border-border bg-[linear-gradient(160deg,#f5ede0,#efe2c7)] p-5">
                <div className="text-xs uppercase tracking-[0.18em] text-muted">
                  {product.category.name}
                </div>
                <div className="mt-8 text-3xl font-semibold tracking-tight text-foreground">
                  {product.name.slice(0, 2).toUpperCase()}
                </div>
              </div>

              <div className="mt-5 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold">{product.name}</h2>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">
                    {product.description || "No description yet."}
                  </p>
                </div>
                <span className="rounded-full bg-background px-3 py-1 text-xs uppercase tracking-[0.18em] text-muted">
                  {product.variants.length} var
                </span>
              </div>

              <div className="mt-6 flex items-center justify-between gap-4">
                <div>
                  <div className="text-lg font-semibold">
                    {formatPriceRange(product.priceRange)}
                  </div>
                  {product.promoPrice != null && product.promoPrice < product.basePrice ? (
                    <div className="text-sm text-muted line-through">
                      {formatCurrency(product.basePrice)}
                    </div>
                  ) : null}
                </div>
                <span className="text-xs text-muted">
                  {product.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </Link>
          ))}
        </section>
      )}

      {totalPages > 1 ? (
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href={buildProductsHref(currentSearchParams, {
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
            href={buildProductsHref(currentSearchParams, {
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
