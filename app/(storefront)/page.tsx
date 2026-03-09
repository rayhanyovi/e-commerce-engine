import Link from "next/link";

import { DataState } from "@/components/ui/data-state";
import { formatCurrency } from "@/lib/formatters";
import { listProducts } from "@/server/catalog";
import { toUserFacingErrorMessage } from "@/lib/user-facing-error";

const scopeOrder = [
  "StoreFront",
  "Admin",
  "Auth",
  "Inventory",
  "Catalog",
  "Cart",
  "Checkout",
  "Payments",
  "Orders",
  "Promotions",
  "Settings",
  "Audit",
];

export default async function StorefrontHomePage() {
  let featuredProducts: Awaited<ReturnType<typeof listProducts>>["products"] = [];
  let errorMessage: string | null = null;

  try {
    const result = await listProducts({
      page: 1,
      pageSize: 3,
      sort: "newest",
    });

    featuredProducts = result.products;
  } catch (error) {
    errorMessage = toUserFacingErrorMessage(
      error,
      "Featured catalog modules are not available yet. Try again after the database is ready.",
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10 lg:px-10">
      <section className="grid gap-6 rounded-[2rem] border border-border bg-surface px-6 py-8 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
        <div className="space-y-5">
          <div className="inline-flex rounded-full border border-border bg-background px-3 py-1 text-xs uppercase tracking-[0.24em] text-muted">
            Storefront First
          </div>
          <div className="space-y-3">
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
              Reusable storefront engine sekarang hidup langsung di root Next app.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-muted sm:text-lg">
              Fokusnya sekarang bukan satu toko tunggal, tapi commerce core yang bisa dipakai ulang
              untuk storefront berbeda dengan UI dan branding yang tinggal disesuaikan.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/products"
              className="rounded-full bg-accent px-5 py-3 text-sm font-medium text-white transition hover:bg-accent-strong"
            >
              Browse Products
            </Link>
            <Link
              href="/categories"
              className="rounded-full border border-border px-5 py-3 text-sm font-medium text-muted transition hover:text-foreground"
            >
              Browse Categories
            </Link>
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-border bg-background p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">Scope Order</p>
          <div className="mt-4 grid gap-2">
            {scopeOrder.map((item, index) => (
              <div key={item} className="flex items-center gap-3 rounded-2xl border border-border px-4 py-3">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-surface text-sm font-semibold">
                  {index + 1}
                </span>
                <span className="text-sm font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {!featuredProducts.length ? (
        <DataState
          tone={errorMessage ? "error" : "empty"}
          eyebrow={errorMessage ? "Featured Catalog Error" : "Catalog Empty"}
          title={errorMessage ? "Featured products are not available yet" : "Featured products are still empty"}
          description={
            errorMessage ??
            "Seed the database or publish products from the admin catalog workspace to populate the storefront spotlight."
          }
          actions={[
            { href: "/products", label: "Open catalog" },
            { href: "/admin/catalog", label: "Open admin catalog", variant: "secondary" },
          ]}
        />
      ) : (
        <section className="grid gap-4 md:grid-cols-3">
          {featuredProducts.map((product) => {
            const stockLabel = product.variants.length
              ? `${product.variants.length} variant(s) active`
              : "No variants";
            const displayPrice =
              product.priceRange.min === product.priceRange.max
                ? formatCurrency(product.priceRange.min)
                : `${formatCurrency(product.priceRange.min)} - ${formatCurrency(product.priceRange.max)}`;

            return (
              <Link
                key={product.slug}
                href={`/products/${product.slug}`}
                className="rounded-[1.5rem] border border-border bg-surface p-5 transition hover:-translate-y-0.5 hover:border-accent"
              >
                <div className="inline-flex rounded-full bg-background px-3 py-1 text-xs uppercase tracking-[0.18em] text-muted">
                  {product.category.name}
                </div>
                <h2 className="mt-4 text-xl font-semibold">{product.name}</h2>
                <p className="mt-2 text-sm text-muted">{product.category.name}</p>
                <p className="mt-4 text-sm leading-6 text-muted">
                  {product.description || "Reusable catalog item ready for storefront composition."}
                </p>
                <div className="mt-6 flex items-center justify-between gap-3">
                  <span className="text-lg font-semibold">{displayPrice}</span>
                  <span className="text-right text-xs text-muted">{stockLabel}</span>
                </div>
              </Link>
            );
          })}
        </section>
      )}
    </main>
  );
}
