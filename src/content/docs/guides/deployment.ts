import type { Metadata } from "next";

export const deploymentGuideMetadata: Metadata = {
  title: "Deployment | E-Commerce Engine Docs",
  description:
    "Production deployment checklist, Docker setup, and hosting considerations.",
};

export const deploymentGuidePageContent = {
  eyebrow: "Guides",
  title: "Deployment",
  description:
    "Production deployment checklist, Docker setup, and environment configuration.",
  status: "experimental" as const,
  checklist: [
    "Set a strong, unique AUTH_SECRET and never use the default value.",
    "Set APP_URL to your production domain.",
    "Use a managed PostgreSQL instance with backups.",
    "Run database migrations before starting the app.",
    "Change seed admin credentials immediately.",
    "Configure UPLOAD_STORAGE_DRIVER for production file storage.",
  ],
  database: [
    "In production, use db:deploy instead of db:migrate. The deploy command applies pending migrations without interactive prompts.",
  ],
  migrationCommand: "npm run db:deploy",
  docker: [
    "The engine includes a Dockerfile and docker-compose.yml for containerized deployment. The Dockerfile builds a production Next.js image, and Docker Compose can wire the app to PostgreSQL for simple self-hosting or local production rehearsal.",
  ],
  dockerCommand: "docker compose up -d",
  vercel: [
    "For Vercel deployment, set all environment variables in the Vercel dashboard. Use a connection string from a managed database provider such as Supabase, Neon, or Railway for DATABASE_URL. Prisma migrations should run as part of your deployment pipeline rather than being left to runtime.",
  ],
  warning:
    "Never deploy with default seed credentials. Change SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD before running seeds in production, or provision admin accounts through a separate process.",
} as const;
