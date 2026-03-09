import { z } from "zod";

export const AddressInputSchema = z.object({
  recipientName: z.string().min(1),
  phone: z.string().min(1),
  addressLine1: z.string().min(1),
  addressLine2: z.string().optional(),
  district: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  notes: z.string().optional(),
});

export const CreateAddressSchema = AddressInputSchema.extend({
  isDefault: z.boolean().default(false),
});

export type CreateAddressDto = z.infer<typeof CreateAddressSchema>;

export const UpdateAddressSchema = CreateAddressSchema.partial();

export type UpdateAddressDto = z.infer<typeof UpdateAddressSchema>;

export const AddressRecordSchema = AddressInputSchema.extend({
  id: z.string().cuid(),
  isDefault: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type AddressRecord = z.infer<typeof AddressRecordSchema>;
