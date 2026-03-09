"use client";

import Link from "next/link";
import { useState } from "react";

import { addItemToCart } from "@/lib/cart/client";
import { formatCurrency } from "@/lib/formatters";

interface ProductAddToCartVariant {
  id: string;
  label: string;
  sku: string | null;
  unitPrice: number;
  stockOnHand: number;
}

interface ProductAddToCartCardProps {
  productId: string;
  productName: string;
  variants: ProductAddToCartVariant[];
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Failed to add item to cart";
}

export function ProductAddToCartCard({
  productId,
  productName,
  variants,
}: ProductAddToCartCardProps) {
  const firstAvailableVariant =
    variants.find((variant) => variant.stockOnHand > 0) ?? variants[0] ?? null;
  const [selectedVariantId, setSelectedVariantId] = useState(firstAvailableVariant?.id ?? "");
  const [qty, setQty] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const selectedVariant =
    variants.find((variant) => variant.id === selectedVariantId) ?? firstAvailableVariant;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedVariant) {
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);
    setError(null);

    try {
      await addItemToCart({
        productId,
        productVariantId: selectedVariant.id,
        qty,
      });
      setFeedback(`${productName} added to cart`);
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  const maxQty = Math.max(1, selectedVariant?.stockOnHand ?? 1);
  const isOutOfStock = !selectedVariant || selectedVariant.stockOnHand <= 0;

  return (
    <section className="rounded-[1.5rem] border border-border bg-background p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Add to Cart</h2>
          <p className="mt-2 text-sm text-muted">
            Product detail sekarang sudah bisa menambahkan item langsung ke active cart baru.
          </p>
        </div>
        <Link
          href="/cart"
          className="rounded-full border border-border px-4 py-2 text-sm text-muted transition hover:text-foreground"
        >
          Open Cart
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <label className="block text-sm font-medium">
          Variant
          <select
            value={selectedVariantId}
            onChange={(event) => {
              setSelectedVariantId(event.target.value);
              setQty(1);
              setFeedback(null);
              setError(null);
            }}
            className="mt-2 w-full rounded-2xl border border-border bg-surface px-4 py-3 outline-none transition focus:border-accent"
          >
            {variants.map((variant) => (
              <option key={variant.id} value={variant.id}>
                {variant.label} · {formatCurrency(variant.unitPrice)}
              </option>
            ))}
          </select>
        </label>

        <div className="grid gap-4 md:grid-cols-[0.7fr_1.3fr]">
          <label className="block text-sm font-medium">
            Quantity
            <div className="mt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQty((current) => Math.max(1, current - 1))}
                disabled={qty <= 1 || isSubmitting}
                className="h-11 w-11 rounded-full border border-border text-lg text-muted transition hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
              >
                -
              </button>
              <div className="min-w-10 text-center text-base font-medium">{qty}</div>
              <button
                type="button"
                onClick={() => setQty((current) => Math.min(maxQty, current + 1))}
                disabled={isSubmitting || qty >= maxQty}
                className="h-11 w-11 rounded-full border border-border text-lg text-muted transition hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
              >
                +
              </button>
            </div>
          </label>

          <div className="rounded-2xl border border-border bg-surface px-4 py-4 text-sm text-muted">
            <p>Selected variant: {selectedVariant?.label || "-"}</p>
            <p className="mt-2">SKU: {selectedVariant?.sku || "-"}</p>
            <p className="mt-2">Stock on hand: {selectedVariant?.stockOnHand ?? 0}</p>
            <p className="mt-2 text-base font-semibold text-foreground">
              {selectedVariant ? formatCurrency(selectedVariant.unitPrice * qty) : "-"}
            </p>
          </div>
        </div>

        {error ? (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        {feedback ? (
          <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {feedback}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting || isOutOfStock}
          className="rounded-full bg-accent px-5 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-accent/60"
        >
          {isSubmitting ? "Adding..." : isOutOfStock ? "Out of stock" : "Add to Cart"}
        </button>
      </form>
    </section>
  );
}
