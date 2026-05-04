import type { Metadata } from "next";

export const projectStructureMetadata: Metadata = {
  title: "Project Structure | E-Commerce Engine Docs",
  description:
    "Annotated map of the e-commerce engine codebase covering app routes, server modules, shared contracts, client helpers, and the data layer.",
};

export const projectStructurePageContent = {
  eyebrow: "Getting Started",
  title: "Project Structure",
  description:
    "A codebase map of every major directory and its role. Use this page as a reference when navigating the engine for the first time or when deciding where to place new code.",
  directoryTree: `app/                    -> Next.js App Router pages and route handlers
  (auth)/               -> Login and register pages
  (storefront)/         -> Customer-facing storefront pages
  admin/                -> Admin dashboard and management pages
  api/                  -> API route handlers (36 endpoints)
  docs/                 -> Documentation pages

src/
  server/               -> Reusable business modules (23 modules)
    auth/               -> Session, guards, password hashing
    catalog/            -> Products, categories, variants
    cart/               -> Cart lifecycle and session management
    checkout/           -> Quote building and checkout preview
    orders/             -> Order placement and lifecycle
    payments/           -> Payment proof and review queue
    promotions/         -> Discount engine and voucher validation
    inventory/          -> Stock adjustments and reservations
    addresses/          -> Customer address management
    settings/           -> Store configuration
    audit/              -> Audit log reading and writing
    dashboard/          -> Admin dashboard metrics
    users/              -> User management
    domain/             -> Pure domain entities and helpers
    db/                 -> Prisma client instance
    http/               -> HTTP error utilities
    security/           -> CSRF and origin checks

  shared/contracts/     -> Zod schemas, DTOs, error codes, envelopes
    dto/                -> Domain-specific validation schemas (12 files)
    envelopes.ts        -> ApiResponse<T> and ApiErrorResponse
    error-codes.ts      -> 16 typed error codes

  lib/                  -> Client request helpers by domain (13 modules)
  hooks/                -> Client hooks (useSession, useCart)
  components/           -> Presentational and interactive components
  content/              -> Content data files for documentation

prisma/
  schema.prisma         -> Database schema (20+ models, 10 enums)
  seed.ts               -> Database seeding script
  migrations/           -> Prisma migration history`,
  layersIntro:
    "The codebase is organized into five distinct layers. Each layer has a clear responsibility and communicates with adjacent layers through well-defined boundaries. Understanding these layers helps you decide where new code belongs and how data flows through the system.",
  layers: [
    {
      title: "App Router UI",
      description:
        "Pages, layouts, route handlers, and SSR boundaries. This layer composes server modules and renders the storefront, admin dashboard, and API endpoints. All Next.js App Router conventions live here.",
      href: "/docs/architecture",
      badge: "app/",
    },
    {
      title: "Server Modules",
      description:
        "Reusable business modules covering every domain: catalog, cart, checkout, orders, payments, promotions, inventory, and more. Each module exports pure functions that accept validated inputs and return typed results.",
      href: "/docs/architecture#server-first",
      badge: "src/server/",
    },
    {
      title: "Shared Contracts",
      description:
        "Zod schemas that serve as the single source of truth for validation. DTOs, response envelopes, and error codes are defined here and consumed by both server-side route handlers and client-side helpers.",
      href: "/docs/architecture#contract-boundary",
      badge: "src/shared/contracts/",
    },
    {
      title: "Client Integration",
      description:
        "Thin fetch wrappers organized by domain and React hooks for local state. These modules handle request serialization, response parsing, and cache invalidation without embedding business logic.",
      badge: "src/lib/ + src/hooks/",
    },
    {
      title: "Data Layer",
      description:
        "The Prisma schema defines 20+ models and 10 enums. Migrations track every schema change, and the seed script populates the database with realistic sample data for development and testing.",
      href: "/docs/data-model",
      badge: "prisma/",
    },
  ],
} as const;
