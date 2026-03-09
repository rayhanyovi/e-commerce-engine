"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { updateAdminOrderStatusRequest } from "@/lib/orders/client";
import type { OrderStatus } from "@/shared/contracts";

const ORDER_STATUS_OPTIONS: OrderStatus[] = [
  "PENDING_PAYMENT",
  "PAYMENT_REVIEW",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "COMPLETED",
  "CANCELLED",
];

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Failed to update order status";
}

export function AdminOrderStatusForm({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: OrderStatus;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<OrderStatus>(currentStatus);
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      await updateAdminOrderStatusRequest(orderId, {
        status,
        note: note.trim() || undefined,
      });
      setSuccess("Order status updated");
      router.refresh();
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-[1.5rem] border border-border bg-surface p-5">
      <h2 className="text-lg font-semibold">Update Status</h2>
      <div className="mt-4 grid gap-4">
        <label className="text-sm font-medium">
          Next Status
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as OrderStatus)}
            className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 outline-none transition focus:border-accent"
          >
            {ORDER_STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm font-medium">
          Note
          <textarea
            rows={3}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Optional audit note"
            className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 outline-none transition focus:border-accent"
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
        {isSubmitting ? "Updating..." : "Update Order Status"}
      </button>
    </form>
  );
}
