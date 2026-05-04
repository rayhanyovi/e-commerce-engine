import type { Metadata } from "next";

import { codeExamples, serverModules } from "./reference-data";

export const serverModulesMetadata: Metadata = {
  title: "Server Modules | E-Commerce Engine Docs",
  description:
    "Reusable business modules that keep auth, catalog, cart, checkout, orders, payments, promotions, inventory, settings, and audit logic in one stable layer.",
};

export const serverModulesPageContent = {
  eyebrow: "Engine Internals",
  title: "Server Modules",
  description:
    "Core business logic lives in reusable server modules, not in pages, hooks, or client helpers.",
  overview:
    'The engine keeps domain rules inside `src/server/`. Route handlers, server components, and admin surfaces call these modules directly rather than re-implementing business logic at the edge of the app. That keeps state transitions, validation, and persistence flows stable across every storefront that reuses the engine.',
  sectionTitle: "Module Catalog",
  modules: serverModules,
  example:
    codeExamples.find((example) => example.title === "Server-side checkout preview") ??
    codeExamples[0],
} as const;
