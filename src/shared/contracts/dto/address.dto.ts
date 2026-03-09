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
