import { z } from "zod";

import { PaginationQuerySchema } from "../envelopes";

export const RegisterSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  phone: z.string().optional(),
});

export type RegisterDto = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type LoginDto = z.infer<typeof LoginSchema>;

export const UpdateProfileSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  phone: z.string().optional(),
});

export type UpdateProfileDto = z.infer<typeof UpdateProfileSchema>;

export const UserListQuerySchema = PaginationQuerySchema.extend({
  role: z.enum(["CUSTOMER", "ADMIN"]).optional(),
  search: z.string().optional(),
});

export type UserListQuery = z.infer<typeof UserListQuerySchema>;
