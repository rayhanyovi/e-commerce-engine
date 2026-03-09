"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { reviewPaymentRequest } from "@/lib/payments/client";
import type { PaymentStatus } from "@/shared/contracts";

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Failed to review payment";
}

export function AdminPaymentReviewForm({
  paymentId,
  currentStatus,
}: {
  paymentId: string;
  currentStatus: PaymentStatus;
}) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [decision, setDecision] = useState<"CONFIRMED" | "REJECTED">("CONFIRMED");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      await reviewPaymentRequest(paymentId, {
        decision,
        note: note.trim() || undefined,
      });
      setSuccess(`Payment ${decision === "CONFIRMED" ? "confirmed" : "rejected"}`);
      router.refresh();
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-background p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-medium text-foreground">Review Queue Action</p>
        <span className="text-xs uppercase tracking-[0.18em] text-muted">{currentStatus}</span>
      </div>

      <div className="mt-4 grid gap-4">
        <label className="text-sm font-medium">
          Decision
          <select
            value={decision}
            onChange={(event) =>
              setDecision(event.target.value as "CONFIRMED" | "REJECTED")
            }
            className="mt-2 w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none transition focus:border-accent"
          >
            <option value="CONFIRMED">Confirm payment</option>
            <option value="REJECTED">Reject payment</option>
          </select>
        </label>

        <label className="text-sm font-medium">
          Note
          <textarea
            rows={3}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Optional review note"
            className="mt-2 w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none transition focus:border-accent"
          />
        </label>
      </div>

      {error ? (
        <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {success ? (
        <p className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {success}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-4 rounded-full bg-accent px-5 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-accent/60"
      >
        {isSubmitting ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}
