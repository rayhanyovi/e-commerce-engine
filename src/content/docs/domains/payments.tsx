import type { Metadata } from "next";

import type { DomainDocPageContent } from "./shared";

export const paymentsMetadata: Metadata = {
  title: "Payments | E-Commerce Engine Docs",
  description:
    "Manual transfer proof uploads, admin review queue, and payment status flow.",
};

export const paymentsPageContent: DomainDocPageContent = {
  eyebrow: "Commerce Domains",
  title: "Payments",
  description:
    "Manual transfer proof uploads, admin review queue, and payment status flow.",
  status: "stable",
  currentHref: "/docs/domains/payments",
  sections: [
    {
      id: "overview",
      title: "Overview",
      blocks: [
        {
          type: "paragraphs",
          items: [
            <>
              The payment domain currently supports{" "}
              <code>MANUAL_TRANSFER</code>. Customers receive transfer
              instructions after placing an order, then upload proof of payment
              such as a transfer receipt screenshot or PDF. Admins review those
              submissions through a dedicated queue, confirming or rejecting each
              payment with optional notes.
            </>,
          ],
        },
      ],
    },
    {
      id: "payment-status-flow",
      title: "Payment Status Flow",
      blocks: [
        {
          type: "flow",
          title: "Payment Status Flow",
          diagram: `PENDING -> SUBMITTED -> UNDER_REVIEW -> CONFIRMED
                           \-> REJECTED`,
        },
      ],
    },
    {
      id: "payment-proof",
      title: "Payment Proof",
      blocks: [
        {
          type: "paragraphs",
          items: [
            "Customers upload payment proof files that serve as evidence of completed transfer. The following constraints apply:",
          ],
        },
        {
          type: "bullets",
          items: [
            <>
              <strong>Accepted MIME types:</strong> <code>image/jpeg</code>,{" "}
              <code>image/png</code>, <code>image/webp</code>, and{" "}
              <code>application/pdf</code>.
            </>,
            <>
              <strong>Maximum file size:</strong> 25 MB.
            </>,
            <>
              <strong>Storage:</strong> Files are stored through a configurable
              provider, with a mock provider used in development.
            </>,
          ],
        },
        {
          type: "paragraphs",
          items: [
            "The uploaded proof URL or file path is stored on the payment record and made available to admins in the review queue.",
          ],
        },
      ],
    },
    {
      id: "admin-review",
      title: "Admin Review",
      blocks: [
        {
          type: "paragraphs",
          items: [
            <>
              The admin review queue lists all payments with{" "}
              <code>SUBMITTED</code> or <code>UNDER_REVIEW</code> status, sorted
              by submission time. Admins can:
            </>,
          ],
        },
        {
          type: "bullets",
          items: [
            <>
              <strong>Confirm</strong> a payment - marks it as{" "}
              <code>CONFIRMED</code> and automatically transitions the
              associated order to <code>PAID</code>.
            </>,
            <>
              <strong>Reject</strong> a payment - marks it as{" "}
              <code>REJECTED</code> with a required reason so the customer can
              re-submit corrected proof.
            </>,
          ],
        },
      ],
    },
    {
      id: "server-module",
      title: "Server Module",
      blocks: [
        {
          type: "paragraphs",
          items: ["The payment service provides the following functions:"],
        },
        {
          type: "bullets",
          items: [
            <>
              <strong>getPaymentInstructions</strong> - Returns transfer
              instructions for a specific order payment.
            </>,
            <>
              <strong>uploadPaymentProof</strong> - Handles proof upload and
              associates the result with the payment record.
            </>,
            <>
              <strong>listAdminPaymentReviewQueue</strong> - Retrieves payments
              awaiting review with order and customer context.
            </>,
            <>
              <strong>reviewPayment</strong> - Processes an admin confirmation
              or rejection with notes and audit logging.
            </>,
          ],
        },
      ],
    },
    {
      id: "api-endpoints",
      title: "API Endpoints",
      blocks: [
        {
          type: "routes",
          endpoints: [
            {
              method: "GET",
              path: "/api/orders/[orderId]/payment-instructions",
              summary: "Get transfer instructions and payment details for an order",
              access: "Customer",
            },
            {
              method: "POST",
              path: "/api/orders/[orderId]/payment-proof",
              summary: "Upload payment proof file for an order's pending payment",
              access: "Customer",
            },
            {
              method: "GET",
              path: "/api/admin/payments/review-queue",
              summary: "List payments awaiting admin review with order context",
              access: "Admin",
            },
            {
              method: "POST",
              path: "/api/admin/payments/[paymentId]/review",
              summary: "Confirm or reject a payment with notes and automatic order status update",
              access: "Admin",
            },
          ],
        },
      ],
    },
  ],
};
