"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { uploadPaymentProofRequest } from "@/lib/payments/client";
import type { PaymentStatus, UploadPaymentProofDto } from "@/shared/contracts";

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Failed to upload payment proof";
}

export function PaymentProofUploadForm({
  orderId,
  paymentStatus,
}: {
  orderId: string;
  paymentStatus: PaymentStatus;
}) {
  const router = useRouter();
  const [filePath, setFilePath] = useState("");
  const [fileName, setFileName] = useState("");
  const [mimeType, setMimeType] = useState<NonNullable<UploadPaymentProofDto["mimeType"]>>(
    "image/jpeg",
  );
  const [fileSize, setFileSize] = useState("");
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
      await uploadPaymentProofRequest(orderId, {
        filePath: filePath.trim(),
        fileName: fileName.trim() || undefined,
        mimeType,
        fileSize: fileSize ? Number(fileSize) : undefined,
        note: note.trim() || undefined,
      });
      setSuccess("Payment proof uploaded");
      setNote("");
      setFileSize("");
      router.refresh();
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (paymentStatus === "CONFIRMED") {
    return (
      <section className="rounded-[1.5rem] border border-border bg-surface p-5">
        <h2 className="text-lg font-semibold">Payment Proof</h2>
        <p className="mt-4 text-sm leading-7 text-muted">
          Payment sudah dikonfirmasi admin, jadi proof baru tidak perlu diupload lagi.
        </p>
      </section>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-[1.5rem] border border-border bg-surface p-5">
      <h2 className="text-lg font-semibold">Upload Payment Proof</h2>
      <p className="mt-3 text-sm leading-7 text-muted">
        Batch ini masih pakai mock manual upload. Isi lokasi file atau URL bukti transfer, lalu
        admin akan review dari dashboard payments. Yang diterima hanya HTTPS URL atau internal path
        di bawah `/uploads/`, dengan MIME image/jpeg, image/png, image/webp, atau application/pdf.
      </p>

      <div className="mt-4 grid gap-4">
        <label className="text-sm font-medium">
          File Path or URL
          <input
            required
            value={filePath}
            onChange={(event) => setFilePath(event.target.value)}
            placeholder="https://cdn.example.com/proofs/order-proof.jpg atau /uploads/payments/order-proof.jpg"
            className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 outline-none transition focus:border-accent"
          />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium">
            File Name
            <input
              value={fileName}
              onChange={(event) => setFileName(event.target.value)}
              placeholder="transfer-proof.jpg"
              className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 outline-none transition focus:border-accent"
            />
          </label>

          <label className="text-sm font-medium">
            MIME Type
            <select
              value={mimeType}
              onChange={(event) =>
                setMimeType(event.target.value as NonNullable<UploadPaymentProofDto["mimeType"]>)
              }
              className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 outline-none transition focus:border-accent"
            >
              <option value="image/jpeg">image/jpeg</option>
              <option value="image/png">image/png</option>
              <option value="image/webp">image/webp</option>
              <option value="application/pdf">application/pdf</option>
            </select>
          </label>
        </div>

        <label className="text-sm font-medium">
          File Size in Bytes
          <input
            inputMode="numeric"
            value={fileSize}
            onChange={(event) => setFileSize(event.target.value.replace(/[^\d]/g, ""))}
            placeholder="245000"
            className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 outline-none transition focus:border-accent"
          />
        </label>

        <label className="text-sm font-medium">
          Note
          <textarea
            rows={3}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Optional note for admin reviewer"
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
        {isSubmitting ? "Uploading..." : "Upload Proof"}
      </button>
    </form>
  );
}
