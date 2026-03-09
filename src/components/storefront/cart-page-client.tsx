"use client";

import Link from "next/link";
import { useState } from "react";

import { useCart } from "@/hooks/use-cart";
import { formatCurrency } from "@/lib/formatters";

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Cart action failed";
}

export function CartPageClient() {
  const { items, itemCount, subtotal, isLoading, error, refreshCart, updateQty, removeItem, clearCart } =
    useCart();
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [lastAction, setLastAction] = useState<string | null>(null);
  const hasBlockingWarnings = items.some(
    (item) => item.warnings.inactiveProduct || item.warnings.inactiveVariant || item.warnings.insufficientStock,
  );

  async function handleQty(itemId: string, nextQty: number) {
    setBusyKey(`qty:${itemId}`);
    setActionError(null);
    setLastAction(null);

    try {
      await updateQty({ itemId, qty: nextQty });
      setLastAction("Cart quantity updated");
    } catch (error) {
      setActionError(getErrorMessage(error));
    } finally {
      setBusyKey(null);
    }
  }

  async function handleRemove(itemId: string) {
    setBusyKey(`remove:${itemId}`);
    setActionError(null);
    setLastAction(null);

    try {
      await removeItem(itemId);
      setLastAction("Item removed from cart");
    } catch (error) {
      setActionError(getErrorMessage(error));
    } finally {
      setBusyKey(null);
    }
  }

  async function handleClearCart() {
    setBusyKey("clear");
    setActionError(null);
    setLastAction(null);

    try {
      await clearCart();
      setLastAction("Cart cleared");
    } catch (error) {
      setActionError(getErrorMessage(error));
    } finally {
      setBusyKey(null);
    }
  }

  if (isLoading) {
    return (
      <section className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, index) => (
            <div
              key={index}
              className="h-44 animate-pulse rounded-[1.5rem] border border-border bg-surface"
            />
          ))}
        </div>
        <div className="h-64 animate-pulse rounded-[1.5rem] border border-border bg-surface" />
      </section>
    );
  }

  if (error && !items.length) {
    return (
      <section className="rounded-[1.75rem] border border-border bg-surface p-8">
        <p className="text-sm uppercase tracking-[0.18em] text-muted">Cart Error</p>
        <h1 className="mt-4 text-3xl font-semibold">Cart is not available</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">{error}</p>
        <button
          type="button"
          onClick={() => void refreshCart().catch(() => undefined)}
          className="mt-6 rounded-full bg-accent px-5 py-3 text-sm font-medium text-white"
        >
          Retry Cart Query
        </button>
      </section>
    );
  }

  if (!items.length) {
    return (
      <section className="rounded-[2rem] border border-border bg-surface p-8 lg:p-10">
        <p className="text-sm uppercase tracking-[0.18em] text-muted">Active Cart</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">Your cart is empty</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
          Guest cart cookie dan active cart lookup sekarang sudah hidup. Lanjutkan ke products
          untuk menambah item pertama dan cek flow baru end-to-end.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/products"
            className="rounded-full bg-accent px-5 py-3 text-sm font-medium text-white"
          >
            Browse Products
          </Link>
          <Link
            href="/"
            className="rounded-full border border-border px-5 py-3 text-sm font-medium text-muted transition hover:text-foreground"
          >
            Back to Home
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-4">
        <section className="rounded-[1.5rem] border border-border bg-surface p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.18em] text-muted">Active Cart</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight">
                {itemCount} item(s) ready for checkout
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
                Cart sekarang dibaca dari API handlers root Next app dan tetap aman untuk guest
                maupun session user.
              </p>
            </div>
            <button
              type="button"
              onClick={() => void handleClearCart()}
              disabled={busyKey === "clear"}
              className="rounded-full border border-border px-4 py-2 text-sm text-muted transition hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busyKey === "clear" ? "Clearing..." : "Clear Cart"}
            </button>
          </div>

          {actionError ? (
            <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {actionError}
            </p>
          ) : null}

          {lastAction ? (
            <p className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {lastAction}
            </p>
          ) : null}
        </section>

        {items.map((item) => {
          const qtyBusy = busyKey === `qty:${item.id}`;
          const removeBusy = busyKey === `remove:${item.id}`;

          return (
            <article
              key={item.id}
              className="rounded-[1.5rem] border border-border bg-surface p-5"
            >
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex gap-4">
                  <div className="flex h-24 w-24 items-end rounded-[1.25rem] border border-border bg-[linear-gradient(160deg,#f5ede0,#efe2c7)] p-3">
                    <span className="rounded-full bg-background px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-muted">
                      {item.product.name.slice(0, 2).toUpperCase()}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <Link
                      href={`/products/${item.product.slug}`}
                      className="text-lg font-semibold transition hover:text-accent"
                    >
                      {item.product.name}
                    </Link>
                    <p className="text-sm text-muted">{item.variantLabel || item.variant.sku || "-"}</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full border border-border px-3 py-1 text-xs text-muted">
                        Unit {formatCurrency(item.unitPrice)}
                      </span>
                      <span className="rounded-full border border-border px-3 py-1 text-xs text-muted">
                        Stock {item.warnings.availableQty} available
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-left lg:text-right">
                  <p className="text-sm text-muted">Line total</p>
                  <p className="mt-2 text-2xl font-semibold">{formatCurrency(item.lineTotal)}</p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => void handleQty(item.id, item.qty - 1)}
                    disabled={item.qty <= 1 || qtyBusy || !!busyKey}
                    className="h-10 w-10 rounded-full border border-border text-lg text-muted transition hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    -
                  </button>
                  <div className="min-w-10 text-center text-sm font-medium">{item.qty}</div>
                  <button
                    type="button"
                    onClick={() => void handleQty(item.id, item.qty + 1)}
                    disabled={qtyBusy || !!busyKey}
                    className="h-10 w-10 rounded-full border border-border text-lg text-muted transition hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => void handleRemove(item.id)}
                  disabled={removeBusy || !!busyKey}
                  className="rounded-full border border-border px-4 py-2 text-sm text-muted transition hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {removeBusy ? "Removing..." : "Remove"}
                </button>
              </div>

              {item.warnings.inactiveProduct || item.warnings.inactiveVariant ? (
                <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  Item ini sudah tidak aktif dan sebaiknya dikeluarkan dari cart sebelum checkout.
                </p>
              ) : null}

              {item.warnings.insufficientStock ? (
                <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  Requested qty exceeds current stock. Available now: {item.warnings.availableQty}.
                </p>
              ) : null}
            </article>
          );
        })}
      </div>

      <aside className="rounded-[1.5rem] border border-border bg-surface p-5">
        <p className="text-sm uppercase tracking-[0.18em] text-muted">Summary</p>
        <div className="mt-5 space-y-3 text-sm text-muted">
          <div className="flex items-center justify-between">
            <span>Items</span>
            <span>{itemCount}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Shipping</span>
            <span>Calculated at checkout</span>
          </div>
          <div className="flex items-center justify-between text-base font-semibold text-foreground">
            <span>Total</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <Link
            href="/checkout"
            className={`block rounded-full px-5 py-3 text-center text-sm font-medium ${
              hasBlockingWarnings
                ? "pointer-events-none bg-accent/60 text-white"
                : "bg-accent text-white"
            }`}
          >
            {hasBlockingWarnings ? "Resolve cart warnings first" : "Continue to Checkout"}
          </Link>
          <Link
            href="/products"
            className="block rounded-full border border-border px-5 py-3 text-center text-sm font-medium text-muted transition hover:text-foreground"
          >
            Continue Shopping
          </Link>
        </div>

        {hasBlockingWarnings ? (
          <p className="mt-4 text-sm leading-6 text-muted">
            Checkout sengaja ditahan saat ada item inactive atau qty melebihi stok aktif.
          </p>
        ) : (
          <p className="mt-4 text-sm leading-6 text-muted">
            Batch berikutnya akan menyambungkan ringkasan ini ke checkout preview dan order placement.
          </p>
        )}
      </aside>
    </section>
  );
}
