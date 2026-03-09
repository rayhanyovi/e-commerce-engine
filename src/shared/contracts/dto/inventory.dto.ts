import { z } from "zod";

import { PaginationQuerySchema } from "../envelopes";

export const AdjustStockSchema = z.object({
  productVariantId: z.string().cuid(),
  qty: z.number().int().refine((value) => value !== 0, {
    message: "Quantity cannot be zero",
  }),
  reason: z.string().trim().min(1).max(255).optional(),
});

export type AdjustStockDto = z.infer<typeof AdjustStockSchema>;

export const StockMovementsQuerySchema = PaginationQuerySchema.extend({
  productVariantId: z.string().cuid().optional(),
  type: z.enum([
    "ADJUSTMENT_IN",
    "ADJUSTMENT_OUT",
    "ORDER_RESERVE",
    "ORDER_CANCEL_RELEASE",
    "ORDER_CONSUME",
    "INITIAL_STOCK",
  ]).optional(),
});

export type StockMovementsQuery = z.infer<typeof StockMovementsQuerySchema>;

export const LowStockQuerySchema = PaginationQuerySchema.extend({
  threshold: z.coerce.number().int().min(0).default(5),
});

export type LowStockQuery = z.infer<typeof LowStockQuerySchema>;
