import type { Metadata } from "next";

import { environmentVariables } from "./reference-data";

const requiredVariables = new Set(["DATABASE_URL", "AUTH_SECRET", "APP_URL"]);

export const environmentMetadata: Metadata = {
  title: "Environment Variables | E-Commerce Engine Docs",
  description:
    "Complete reference for every environment variable used by the e-commerce engine, including defaults and usage notes.",
};

export const environmentPageContent = {
  eyebrow: "Getting Started",
  title: "Environment Variables",
  description:
    "Configuration reference for the e-commerce engine. Copy .env.local.example to .env.local and adjust the values below for your environment.",
  intro:
    "The engine reads all configuration from environment variables at runtime. Required variables must be set for the application to start. Optional variables have sensible defaults for local development. The table below lists every supported variable, its default value, and what it controls.",
  variables: environmentVariables.map((variable) => ({
    ...variable,
    required: requiredVariables.has(variable.name),
  })),
  sampleEnv: `# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ecommerce_engine?schema=public"

# Auth
AUTH_SECRET="generate-a-random-secret-here"

# App
APP_URL="http://localhost:3000"

# File Uploads
UPLOAD_STORAGE_DRIVER="mock"
UPLOAD_STORAGE_BASE_URL="http://localhost:3000/uploads"

# Locale
DEFAULT_TIMEZONE="Asia/Jakarta"
DEFAULT_CURRENCY="IDR"
DEFAULT_LOCALE="id-ID"

# Seed Data (only used by npm run db:seed)
SEED_ADMIN_EMAIL="admin@example.com"
SEED_ADMIN_NAME="Store Admin"
SEED_ADMIN_PHONE="+6280000000000"
SEED_ADMIN_PASSWORD="Admin12345!"`,
  warningTitle: "Keep Secrets Out of Version Control",
  warningBody:
    "Never commit .env.local to version control. The .gitignore file already excludes it, but double-check before pushing. Use your deployment platform's secret management for production values, especially AUTH_SECRET and DATABASE_URL.",
} as const;
