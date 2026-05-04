import type { Metadata } from "next";

export const quickstartMetadata: Metadata = {
  title: "Quickstart | E-Commerce Engine Docs",
  description:
    "Get the e-commerce engine running locally in under five minutes with PostgreSQL, Prisma, and Next.js.",
};

export const quickstartPageContent = {
  eyebrow: "Getting Started",
  title: "Quickstart",
  description:
    "Get the engine running on your local machine in four steps. You will need Node.js 18+, npm, and a running PostgreSQL instance before you begin.",
  steps: [
    {
      title: "Bootstrap the workspace",
      description:
        "Copy the example environment file to create your local configuration, install all dependencies with a clean install, and make sure your PostgreSQL instance is reachable at the URL defined in DATABASE_URL.",
      code: {
        code: "cp .env.local.example .env.local\nnpm ci",
        language: "bash",
      },
    },
    {
      title: "Prepare Prisma and seed data",
      description:
        "Generate the Prisma client so TypeScript types match your schema, run any pending migrations to set up database tables and indexes, then seed the database with sample products, categories, and an admin account.",
      code: {
        code: "npm run db:generate\nnpm run db:migrate\nnpm run db:seed",
        language: "bash",
      },
    },
    {
      title: "Start the engine",
      description:
        "Launch the development server with hot reload for rapid iteration, or build and start a production bundle to test optimized performance. The storefront, admin dashboard, API, and docs all run on a single Next.js server.",
      code: {
        code:
          "# Development (hot reload)\nnpm run dev\n\n# Production\nnpm run build\nnpm run start",
        language: "bash",
      },
    },
    {
      title: "Build on the engine",
      description:
        "New storefronts and integrations consume the shared contracts in src/shared/contracts/ for type-safe validation, server modules in src/server/ for business logic, and client helpers in src/lib/ for fetch wrappers. Start by exploring the existing storefront pages in app/(storefront)/ for patterns to follow.",
    },
  ],
  fullCommand: "npm ci\nnpm run db:generate\nnpm run db:migrate\nnpm run db:seed\nnpm run dev",
  adminCalloutTitle: "Default Admin Credentials",
  adminCalloutBody:
    "Default admin credentials: admin@example.com / Admin12345! Change these immediately outside local development. You can customize seed credentials via the SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD environment variables before running the seed script.",
} as const;
