"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import type { ApiEnvelope } from "@/shared/contracts";

interface AdjustmentSuccess {
  variant: {
    id: string;
    stockOnHand: number;
  };
  movement: {
    referenceId: string | null;
  };
}

export function InventoryAdjustmentForm() {
  const router = useRouter();
  const [productVariantId, setProductVariantId] = useState("");
  const [qty, setQty] = useState("");
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/inventory/adjust", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productVariantId,
          qty: Number(qty),
          reason: reason || undefined,
        }),
      });
      const payload = (await response.json()) as ApiEnvelope<AdjustmentSuccess>;

      if (!response.ok || !payload.success) {
        const message =
          payload.success === false ? payload.error.message : "Failed to adjust stock";
        throw new Error(message);
      }

      setMessage(
        `Stock updated. Variant ${payload.data.variant.id} sekarang punya ${payload.data.variant.stockOnHand} unit. Reference: ${payload.data.movement.referenceId ?? "-"}.`,
      );
      setProductVariantId("");
      setQty("");
      setReason("");
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to adjust stock",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[1.5rem] border border-border bg-background p-5"
    >
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Manual Stock Adjustment</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          Gunakan variant ID dan quantity positif/negatif untuk adjustment cepat. Guard server akan
          menolak stock negatif.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm font-medium">
          Variant ID
          <input
            required
            value={productVariantId}
            onChange={(event) => setProductVariantId(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-border bg-surface px-4 py-3 outline-none transition focus:border-accent"
            placeholder="cma..."
          />
        </label>

        <label className="block text-sm font-medium">
          Quantity
          <input
            required
            type="number"
            value={qty}
            onChange={(event) => setQty(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-border bg-surface px-4 py-3 outline-none transition focus:border-accent"
            placeholder="10 or -5"
          />
        </label>
      </div>

      <label className="mt-4 block text-sm font-medium">
        Reason
        <textarea
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          className="mt-2 min-h-24 w-full rounded-2xl border border-border bg-surface px-4 py-3 outline-none transition focus:border-accent"
          placeholder="Receiving stock, cycle count correction, damaged stock, dll."
        />
      </label>

      {message ? (
        <p className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </p>
      ) : null}

      {error ? (
        <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-4 rounded-full bg-accent px-5 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Adjusting..." : "Submit Adjustment"}
      </button>
    </form>
  );
}
