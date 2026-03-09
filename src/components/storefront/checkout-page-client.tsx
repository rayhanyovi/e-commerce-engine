"use client";

import Link from "next/link";
import { startTransition, useEffect, useState } from "react";

import { fetchCheckoutPreview } from "@/lib/checkout/client";
import { formatCurrency } from "@/lib/formatters";
import type { CheckoutPreviewResult } from "@/shared/contracts";

function parseVoucherCodes(value: string) {
  return value
    .split(/[\n,]+/)
    .map((code) => code.trim())
    .filter(Boolean);
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Checkout preview failed";
}

export function CheckoutPageClient() {
  const [preview, setPreview] = useState<CheckoutPreviewResult | null>(null);
  const [voucherInput, setVoucherInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastAction, setLastAction] = useState<string | null>(null);

  async function loadPreview(voucherCodes: string[], mode: "initial" | "submit" = "submit") {
    if (mode === "submit") {
      setIsSubmitting(true);
    } else {
      setIsLoading(true);
    }

    setError(null);
    setLastAction(null);

    try {
      const nextPreview = await fetchCheckoutPreview({ voucherCodes });

      startTransition(() => {
        setPreview(nextPreview);
      });

      if (mode === "submit") {
        setLastAction("Checkout preview updated");
      }
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      if (mode === "submit") {
        setIsSubmitting(false);
      } else {
        setIsLoading(false);
      }
    }
  }

  useEffect(() => {
    void loadPreview([], "initial");
  }, []);

  if (isLoading) {
    return (
      <section className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-40 animate-pulse rounded-[1.5rem] border border-border bg-surface"
            />
          ))}
        </div>
        <div className="h-80 animate-pulse rounded-[1.5rem] border border-border bg-surface" />
      </section>
    );
  }

  if (!preview) {
    return (
      <section className="rounded-[1.75rem] border border-border bg-surface p-8">
        <p className="text-sm uppercase tracking-[0.18em] text-muted">Checkout Preview</p>
        <h1 className="mt-4 text-3xl font-semibold">
          {error === "Cart is empty" ? "Checkout needs an active cart" : "Checkout is not available"}
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
          {error ??
            "Preview query failed before a checkout summary could be generated from the active cart."}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/cart"
            className="rounded-full bg-accent px-5 py-3 text-sm font-medium text-white"
          >
            Review Cart
          </Link>
          <button
            type="button"
            onClick={() => void loadPreview([], "initial")}
            className="rounded-full border border-border px-5 py-3 text-sm font-medium text-muted transition hover:text-foreground"
          >
            Retry Preview
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-4">
        <section className="rounded-[1.5rem] border border-border bg-surface p-5">
          <p className="text-sm uppercase tracking-[0.18em] text-muted">Checkout Preview</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            Summary now comes from the live checkout module
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
            Formula subtotal, voucher, shipping, dan total sekarang dihitung dari active cart dan
            `StoreConfig`, bukan mock number lagi.
          </p>

          {lastAction ? (
            <p className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {lastAction}
            </p>
          ) : null}

          {error ? (
            <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          ) : null}
        </section>

        <section className="rounded-[1.5rem] border border-border bg-surface p-5">
          <h2 className="text-lg font-semibold">Shipping Address</h2>
          <p className="mt-3 text-sm leading-7 text-muted">
            Address domain belum dimigrasikan penuh. Batch berikutnya akan menghubungkan saved
            addresses dan inline address snapshot ke preview/order final.
          </p>
          <div className="mt-4 rounded-2xl border border-border bg-background px-4 py-4 text-sm text-muted">
            Current preview memakai shipping method internal flat dengan ETA {preview.shippingEtaDays} day(s).
          </div>
        </section>

        <section className="rounded-[1.5rem] border border-border bg-surface p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Voucher and Promotions</h2>
            <button
              type="button"
              onClick={() => void loadPreview(parseVoucherCodes(voucherInput))}
              disabled={isSubmitting}
              className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-accent/60"
            >
              {isSubmitting ? "Refreshing..." : "Refresh Preview"}
            </button>
          </div>

          <label className="mt-4 block text-sm font-medium">
            Voucher Codes
            <textarea
              rows={3}
              value={voucherInput}
              onChange={(event) => setVoucherInput(event.target.value)}
              placeholder="One code per line or separated by commas"
              className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 outline-none transition focus:border-accent"
            />
          </label>

          {preview.appliedVouchers.length ? (
            <div className="mt-4 space-y-2">
              {preview.appliedVouchers.map((voucher) => (
                <div
                  key={voucher.code}
                  className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
                >
                  {voucher.code} applied: {formatCurrency(voucher.discount)} ({voucher.type})
                </div>
              ))}
            </div>
          ) : null}

          {preview.rejectedVouchers.length ? (
            <div className="mt-4 space-y-2">
              {preview.rejectedVouchers.map((voucher) => (
                <div
                  key={`${voucher.code}-${voucher.reason}`}
                  className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {voucher.code}: {voucher.reason}
                </div>
              ))}
            </div>
          ) : null}
        </section>

        <section className="rounded-[1.5rem] border border-border bg-surface p-5">
          <h2 className="text-lg font-semibold">Payment Mode</h2>
          <p className="mt-3 text-sm leading-7 text-muted">
            Payment masih mock manual transfer. Provider real seperti Xendit akan dipasang setelah
            order placement dan payment review queue selesai.
          </p>
          <div className="mt-4 rounded-2xl border border-border bg-background px-4 py-4 text-sm text-muted">
            Method preview: manual transfer. Final payment instructions akan diambil dari store
            settings pada batch payments/settings.
          </div>
        </section>
      </div>

      <aside className="rounded-[1.5rem] border border-border bg-surface p-5">
        <p className="text-sm uppercase tracking-[0.18em] text-muted">Order Summary</p>
        <div className="mt-5 space-y-4">
          {preview.items.map((item) => (
            <div key={`${item.productId}-${item.productVariantId}`} className="rounded-2xl border border-border bg-background px-4 py-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{item.productName}</p>
                  <p className="mt-1 text-sm text-muted">{item.variantLabel || "-"}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted">{item.qty} item(s)</p>
                  <p className="mt-1 font-medium">{formatCurrency(item.lineSubtotal)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-3 text-sm text-muted">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatCurrency(preview.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Product discount</span>
            <span>- {formatCurrency(preview.productDiscountTotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Voucher</span>
            <span>- {formatCurrency(preview.voucherDiscountTotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>{formatCurrency(preview.shippingCost)}</span>
          </div>
          <div className="flex justify-between">
            <span>ETA</span>
            <span>{preview.shippingEtaDays} day(s)</span>
          </div>
          <div className="flex justify-between text-base font-semibold text-foreground">
            <span>Total</span>
            <span>{formatCurrency(preview.grandTotal)}</span>
          </div>
        </div>

        <button
          type="button"
          disabled
          className="mt-6 w-full cursor-not-allowed rounded-full bg-accent/60 px-5 py-3 text-sm font-medium text-white"
        >
          Place Order Next Batch
        </button>

        <Link
          href="/cart"
          className="mt-3 block rounded-full border border-border px-5 py-3 text-center text-sm font-medium text-muted transition hover:text-foreground"
        >
          Back to Cart
        </Link>

        <p className="mt-4 text-sm leading-6 text-muted">
          {preview.allowGuestCheckout
            ? "Guest checkout is enabled in current store config."
            : "Guest checkout is currently disabled in store config. Order placement will require login unless that setting changes."}
        </p>
      </aside>
    </section>
  );
}
