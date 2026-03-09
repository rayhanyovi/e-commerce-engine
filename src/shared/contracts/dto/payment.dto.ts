import { z } from "zod";

import { PaginationQuerySchema } from "../envelopes";

export const PaymentMethodSchema = z.enum(["MANUAL_TRANSFER"]);

export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;

export const PaymentStatusSchema = z.enum([
  "PENDING",
  "SUBMITTED",
  "UNDER_REVIEW",
  "CONFIRMED",
  "REJECTED",
]);

export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;

export const ReviewPaymentSchema = z.object({
  decision: z.enum(["CONFIRMED", "REJECTED"]),
  note: z.string().trim().max(500).optional(),
});

export type ReviewPaymentDto = z.infer<typeof ReviewPaymentSchema>;

export const UploadPaymentProofSchema = z.object({
  filePath: z.string().trim().min(1).max(512),
  fileName: z.string().trim().min(1).max(255).optional(),
  mimeType: z.string().trim().min(1).max(128).optional(),
  fileSize: z.coerce.number().int().min(0).max(25_000_000).optional(),
  note: z.string().trim().max(500).optional(),
});

export type UploadPaymentProofDto = z.infer<typeof UploadPaymentProofSchema>;

export const PaymentInstructionsSchema = z.object({
  orderId: z.string().cuid(),
  orderNumber: z.string(),
  amount: z.number().int().min(0),
  currency: z.string().min(1),
  paymentMethod: PaymentMethodSchema,
  paymentStatus: PaymentStatusSchema,
  instructions: z.string().min(1),
  proofCount: z.number().int().min(0),
});

export type PaymentInstructions = z.infer<typeof PaymentInstructionsSchema>;

export const PaymentReviewQueueQuerySchema = PaginationQuerySchema.extend({
  status: z.enum(["SUBMITTED", "UNDER_REVIEW"]).optional(),
});

export type PaymentReviewQueueQuery = z.infer<typeof PaymentReviewQueueQuerySchema>;
