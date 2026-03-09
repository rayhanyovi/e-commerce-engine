import { z } from "zod";

import { PaginationQuerySchema } from "../envelopes";

export const AuditActorTypeSchema = z.enum(["ADMIN", "SYSTEM", "CUSTOMER"]);

export type AuditActorType = z.infer<typeof AuditActorTypeSchema>;

export const AuditEntityTypeSchema = z.enum([
  "ORDER",
  "PAYMENT",
  "PROMOTION",
  "INVENTORY",
  "STORE_CONFIG",
]);

export type AuditEntityType = z.infer<typeof AuditEntityTypeSchema>;

export const AuditLogListQuerySchema = PaginationQuerySchema.extend({
  search: z.string().trim().optional(),
  actorType: AuditActorTypeSchema.optional(),
  entityType: AuditEntityTypeSchema.optional(),
  action: z.string().trim().min(1).max(100).optional(),
});

export type AuditLogListQuery = z.infer<typeof AuditLogListQuerySchema>;
