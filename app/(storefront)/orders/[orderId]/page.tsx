import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { PaymentStatusBadge } from "@/components/orders/payment-status-badge";
import { PaymentProofUploadForm } from "@/components/storefront/payment-proof-upload-form";
import { formatCurrency, formatDateTime } from "@/lib/formatters";
import { getServerCurrentUser } from "@/server/auth";
import { AppError } from "@/server/http";
import { getMyOrderById } from "@/server/orders";
import { getPaymentInstructions } from "@/server/payments";
import { ErrorCodes } from "@/shared/contracts";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const user = await getServerCurrentUser();

  if (!user) {
    redirect("/login?redirect=/orders");
  }

  const { orderId } = await params;
  let order: Awaited<ReturnType<typeof getMyOrderById>> | null = null;

  try {
    order = await getMyOrderById(orderId, user.id);
  } catch (error) {
    if (error instanceof AppError && error.code === ErrorCodes.NOT_FOUND) {
      notFound();
    }

    throw error;
  }

  const paymentInstructions = order.latestPayment
    ? await getPaymentInstructions(order.id, user)
    : null;
  const latestPaymentProofs =
    order.latestPayment && "proofs" in order.latestPayment
      ? order.latestPayment.proofs
      : [];

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-10 lg:px-10">
      <Link href="/orders" className="text-sm text-muted transition hover:text-foreground">
        Back to Orders
      </Link>

      <section className="rounded-[1.75rem] border border-border bg-surface p-6 lg:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-muted">Order Detail</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight">{order.orderNumber}</h1>
            <p className="mt-3 text-sm text-muted">
              Placed {formatDateTime(order.placedAt)}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <OrderStatusBadge status={order.status} />
            {order.latestPayment ? (
              <PaymentStatusBadge status={order.latestPayment.status} />
            ) : null}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <section className="rounded-[1.5rem] border border-border bg-surface p-5">
            <h2 className="text-lg font-semibold">Items</h2>
            <div className="mt-4 space-y-3">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-border bg-background px-4 py-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{item.productNameSnapshot}</p>
                      <p className="mt-1 text-sm text-muted">
                        {item.variantLabelSnapshot || "-"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted">{item.qty} item(s)</p>
                      <p className="mt-1 font-medium">
                        {formatCurrency(item.lineSubtotalSnapshot, order.currency)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[1.5rem] border border-border bg-surface p-5">
            <h2 className="text-lg font-semibold">Shipping Snapshot</h2>
            <div className="mt-4 space-y-2 text-sm text-muted">
              <p>{order.addressSnapshot.recipientName}</p>
              <p>{order.addressSnapshot.phone}</p>
              <p>{order.addressSnapshot.addressLine1}</p>
              {order.addressSnapshot.addressLine2 ? <p>{order.addressSnapshot.addressLine2}</p> : null}
              <p>
                {[order.addressSnapshot.district, order.addressSnapshot.city, order.addressSnapshot.postalCode]
                  .filter(Boolean)
                  .join(", ") || "-"}
              </p>
              {order.addressSnapshot.notes ? <p>{order.addressSnapshot.notes}</p> : null}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-[1.5rem] border border-border bg-surface p-5">
            <h2 className="text-lg font-semibold">Summary</h2>
            <div className="mt-4 space-y-3 text-sm text-muted">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(order.subtotal, order.currency)}</span>
              </div>
              <div className="flex justify-between">
                <span>Product discount</span>
                <span>- {formatCurrency(order.productDiscountTotal, order.currency)}</span>
              </div>
              <div className="flex justify-between">
                <span>Voucher</span>
                <span>- {formatCurrency(order.voucherDiscountTotal, order.currency)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{formatCurrency(order.shippingCost, order.currency)}</span>
              </div>
              <div className="flex justify-between">
                <span>ETA</span>
                <span>{order.shippingEtaDays} day(s)</span>
              </div>
              <div className="flex justify-between text-base font-semibold text-foreground">
                <span>Total</span>
                <span>{formatCurrency(order.grandTotal, order.currency)}</span>
              </div>
            </div>
          </section>

          <section className="rounded-[1.5rem] border border-border bg-surface p-5">
            <h2 className="text-lg font-semibold">Payment</h2>
            {order.latestPayment ? (
              <div className="mt-4 space-y-3 text-sm text-muted">
                <div className="flex items-center justify-between">
                  <span>Status</span>
                  <PaymentStatusBadge status={order.latestPayment.status} />
                </div>
                <div className="flex items-center justify-between">
                  <span>Method</span>
                  <span>{order.latestPayment.method}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Amount</span>
                  <span>{formatCurrency(order.latestPayment.amount, order.currency)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Proof count</span>
                  <span>{latestPaymentProofs.length}</span>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm text-muted">Payment record has not been created yet.</p>
            )}
          </section>

          {paymentInstructions ? (
            <section className="rounded-[1.5rem] border border-border bg-surface p-5">
              <h2 className="text-lg font-semibold">Payment Instructions</h2>
              <div className="mt-4 space-y-3 text-sm text-muted">
                <div className="flex items-center justify-between">
                  <span>Method</span>
                  <span>{paymentInstructions.paymentMethod}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Amount</span>
                  <span>{formatCurrency(paymentInstructions.amount, paymentInstructions.currency)}</span>
                </div>
                <div className="text-xs text-muted">
                  Transfer is reviewed under {paymentInstructions.storeName} operating timezone:{" "}
                  {paymentInstructions.timezone}.
                </div>
                <div className="rounded-2xl border border-border bg-background px-4 py-4 leading-7 whitespace-pre-line">
                  {paymentInstructions.instructions}
                </div>
              </div>
            </section>
          ) : null}

          {latestPaymentProofs.length ? (
            <section className="rounded-[1.5rem] border border-border bg-surface p-5">
              <h2 className="text-lg font-semibold">Uploaded Proofs</h2>
              <div className="mt-4 space-y-3">
                {latestPaymentProofs.map((proof) => (
                  <div
                    key={proof.id}
                    className="rounded-2xl border border-border bg-background px-4 py-4 text-sm text-muted"
                  >
                    <p className="font-medium text-foreground">
                      {proof.fileName || proof.filePath}
                    </p>
                    <p className="mt-2 break-all">{proof.filePath}</p>
                    <p className="mt-1">Uploaded {formatDateTime(proof.uploadedAt)}</p>
                    {proof.mimeType ? <p className="mt-1">Type: {proof.mimeType}</p> : null}
                    {proof.fileSize ? (
                      <p className="mt-1">Size: {proof.fileSize.toLocaleString("id-ID")} bytes</p>
                    ) : null}
                    {proof.note ? <p className="mt-1">Note: {proof.note}</p> : null}
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {order.latestPayment ? (
            <PaymentProofUploadForm
              orderId={order.id}
              paymentStatus={order.latestPayment.status}
            />
          ) : null}
        </aside>
      </section>
    </main>
  );
}
