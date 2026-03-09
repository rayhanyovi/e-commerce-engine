import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductAddToCartCard } from "@/components/storefront/product-add-to-cart-card";
import { formatCurrency } from "@/lib/formatters";
import { getPublicProductBySlug } from "@/server/catalog";
import { AppError } from "@/server/http";
import { ErrorCodes } from "@/shared/contracts";

export const dynamic = "force-dynamic";

function formatPriceRange(priceRange: { min: number; max: number }) {
  if (priceRange.min === priceRange.max) {
    return formatCurrency(priceRange.min);
  }

  return `${formatCurrency(priceRange.min)} - ${formatCurrency(priceRange.max)}`;
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let product: Awaited<ReturnType<typeof getPublicProductBySlug>> | null = null;
  let errorMessage: string | null = null;

  try {
    product = await getPublicProductBySlug(slug);
  } catch (error) {
    if (error instanceof AppError && error.code === ErrorCodes.NOT_FOUND) {
      notFound();
    }

    errorMessage =
      error instanceof Error
        ? error.message
        : "Product detail query failed. Check database configuration and seed state.";
  }

  if (!product) {
    return (
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-10 lg:px-10">
        <section className="rounded-[1.75rem] border border-border bg-surface p-8">
          <p className="text-sm uppercase tracking-[0.18em] text-muted">Catalog Error</p>
          <h1 className="mt-4 text-3xl font-semibold">Product detail is not available</h1>
          <p className="mt-4 text-sm leading-7 text-muted">{errorMessage}</p>
        </section>
      </main>
    );
  }

  const optionSummary = product.optionDefinitions.map((option) => ({
    ...option,
    values: option.values.map((value) => value.value),
  }));
  const cartVariants = product.variants.map((variant) => ({
    id: variant.id,
    label: variant.optionCombination.length
      ? variant.optionCombination
          .map(
            (item) =>
              `${item.optionValue.optionDefinition.name}: ${item.optionValue.value}`,
          )
          .join(", ")
      : variant.sku || "Default variant",
    sku: variant.sku,
    unitPrice: variant.priceOverride ?? product.promoPrice ?? product.basePrice,
    stockOnHand: variant.stockOnHand,
  }));

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-10 lg:px-10">
      <Link href="/products" className="text-sm text-muted transition hover:text-foreground">
        Back to Products
      </Link>

      <section className="grid gap-6 rounded-[2rem] border border-border bg-surface p-6 lg:grid-cols-[0.95fr_1.05fr] lg:p-8">
        <div className="flex min-h-[320px] items-end rounded-[1.5rem] border border-border bg-[linear-gradient(160deg,#f5ede0,#efe2c7)] p-6">
          <div className="rounded-full bg-background px-3 py-1 text-xs uppercase tracking-[0.18em] text-muted">
            {product.category.name}
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-muted">{product.category.name}</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight">{product.name}</h1>
            <p className="mt-3 text-sm text-muted">Slug: {product.slug}</p>
          </div>

          <p className="text-base leading-7 text-muted">
            {product.description || "No description yet."}
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <span className="text-2xl font-semibold">
              {formatPriceRange(product.priceRange)}
            </span>
            <span className="rounded-full border border-border px-3 py-1 text-sm text-muted">
              {product.variants.length} active variant(s)
            </span>
          </div>

          {optionSummary.length ? (
            <div className="grid gap-3 md:grid-cols-2">
              {optionSummary.map((option) => (
                <div
                  key={option.id}
                  className="rounded-2xl border border-border bg-background px-4 py-4"
                >
                  <p className="text-sm font-medium">{option.name}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {option.values.map((value) => (
                      <span
                        key={value}
                        className="rounded-full border border-border px-3 py-1 text-xs text-muted"
                      >
                        {value}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          <section className="rounded-[1.5rem] border border-border bg-background p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">Available Variants</h2>
              <span className="text-sm text-muted">Select one below to add into the live cart</span>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-muted">
                  <tr>
                    <th className="pb-3 pr-4 font-medium">Variant</th>
                    <th className="pb-3 pr-4 font-medium">SKU</th>
                    <th className="pb-3 pr-4 font-medium">Price</th>
                    <th className="pb-3 pr-4 font-medium">Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {product.variants.map((variant) => {
                    const variantLabel = variant.optionCombination.length
                      ? variant.optionCombination
                          .map(
                            (item) =>
                              `${item.optionValue.optionDefinition.name}: ${item.optionValue.value}`,
                          )
                          .join(", ")
                      : variant.sku || "-";
                    const variantPrice =
                      variant.priceOverride ?? product.promoPrice ?? product.basePrice;

                    return (
                      <tr key={variant.id} className="border-t border-border">
                        <td className="py-3 pr-4">{variantLabel}</td>
                        <td className="py-3 pr-4 text-muted">{variant.sku || "-"}</td>
                        <td className="py-3 pr-4">{formatCurrency(variantPrice)}</td>
                        <td className="py-3 pr-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs ${
                              variant.stockOnHand > 0
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {variant.stockOnHand} in stock
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <ProductAddToCartCard
            productId={product.id}
            productName={product.name}
            variants={cartVariants}
          />
        </div>
      </section>
    </main>
  );
}
