import type { Metadata } from "next";

import { clientHelpers, codeExamples } from "./reference-data";

export const clientHelpersMetadata: Metadata = {
  title: "Client Helpers | E-Commerce Engine Docs",
  description:
    "Thin same-origin request helpers that connect UI surfaces to shared route handlers without moving business rules into the client.",
};

export const clientHelpersPageContent = {
  eyebrow: "Engine Internals",
  title: "Client Helpers",
  description:
    "Client helpers keep fetch details out of UI components while leaving real business logic on the server.",
  overview:
    "Helpers under `src/lib/*/client.ts` are intentionally thin. They normalize request setup, parse the shared API envelope, and give the UI a stable call site. They should not become an alternative home for pricing, validation, or permission logic.",
  helpers: clientHelpers,
  example:
    codeExamples.find((example) => example.title === "Place an order with idempotency") ??
    codeExamples[0],
} as const;
