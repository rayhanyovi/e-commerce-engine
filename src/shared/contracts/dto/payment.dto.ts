import { z } from "zod";

export const ReviewPaymentSchema = z.object({
  decision: z.enum(["CONFIRMED", "REJECTED"]),
  note: z.string().optional(),
});

export type ReviewPaymentDto = z.infer<typeof ReviewPaymentSchema>;

export const UploadPaymentProofSchema = z.object({
  note: z.string().optional(),
});

export type UploadPaymentProofDto = z.infer<typeof UploadPaymentProofSchema>;
