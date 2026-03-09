import { z } from "zod";

export const serverEnvSchema = z.object({
  DATABASE_URL: z.string().min(1),
  AUTH_SECRET: z.string().min(1),
  APP_URL: z.string().url(),
  UPLOAD_STORAGE_DRIVER: z.enum(["mock", "local", "s3"]).default("mock"),
  UPLOAD_STORAGE_BASE_URL: z.string().url(),
  DEFAULT_TIMEZONE: z.string().min(1).default("Asia/Jakarta"),
  DEFAULT_CURRENCY: z.string().min(1).default("IDR"),
  DEFAULT_LOCALE: z.string().min(1).default("id-ID"),
  SEED_ADMIN_EMAIL: z.string().email().default("admin@example.com"),
  SEED_ADMIN_NAME: z.string().min(1).default("Store Admin"),
  SEED_ADMIN_PHONE: z.string().min(1).default("+6280000000000"),
  SEED_ADMIN_PASSWORD: z.string().min(8).default("Admin12345!"),
});

export const authEnvSchema = serverEnvSchema.pick({
  AUTH_SECRET: true,
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type AuthEnv = z.infer<typeof authEnvSchema>;

export function getServerEnv(input: NodeJS.ProcessEnv = process.env): ServerEnv {
  return serverEnvSchema.parse({
    DATABASE_URL: input.DATABASE_URL,
    AUTH_SECRET: input.AUTH_SECRET,
    APP_URL: input.APP_URL,
    UPLOAD_STORAGE_DRIVER: input.UPLOAD_STORAGE_DRIVER,
    UPLOAD_STORAGE_BASE_URL: input.UPLOAD_STORAGE_BASE_URL,
    DEFAULT_TIMEZONE: input.DEFAULT_TIMEZONE,
    DEFAULT_CURRENCY: input.DEFAULT_CURRENCY,
    DEFAULT_LOCALE: input.DEFAULT_LOCALE,
    SEED_ADMIN_EMAIL: input.SEED_ADMIN_EMAIL,
    SEED_ADMIN_NAME: input.SEED_ADMIN_NAME,
    SEED_ADMIN_PHONE: input.SEED_ADMIN_PHONE,
    SEED_ADMIN_PASSWORD: input.SEED_ADMIN_PASSWORD,
  });
}

export function getAuthEnv(input: NodeJS.ProcessEnv = process.env): AuthEnv {
  return authEnvSchema.parse({
    AUTH_SECRET: input.AUTH_SECRET,
  });
}
