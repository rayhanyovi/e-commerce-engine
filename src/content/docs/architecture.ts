import type { Metadata } from "next";

export const architectureMetadata: Metadata = {
  title: "Architecture Overview | E-Commerce Engine Docs",
  description:
    "Understand the five-layer engine architecture: presentation, engine, contract, client, and data layers working together in a single Next.js deployment.",
};

export const architecturePageContent = {
  eyebrow: "Architecture",
  title: "Architecture Overview",
  description:
    "The engine follows a five-layer architecture where every layer has a single responsibility and communicates with adjacent layers through typed boundaries. All layers ship as a single Next.js application with no external API servers.",
  diagramTitle: "Engine Layers",
  diagram: `+-----------------------------------------+
| Presentation Layer (app/)               |
| Pages, layouts, route handlers          |
+-----------------------------------------+
| Engine Layer (src/server/)              |
| Business logic, domain services         |
+-----------------------------------------+
| Contract Layer (src/shared/contracts/)  |
| Zod schemas, DTOs, error codes          |
+-----------------------------------------+
| Client Layer (src/lib/ + src/hooks/)    |
| Fetch helpers, UI state hooks           |
+-----------------------------------------+
| Data Layer (prisma/)                    |
| Schema, migrations, seed data           |
+-----------------------------------------+`,
  sections: {
    sameOrigin: [
      "The storefront, admin dashboard, and API all live in the same Next.js application and are served from the same origin. There is no separate API server, no CORS configuration, and no cross-origin token exchange. This simplifies deployment, eliminates an entire class of configuration bugs, and makes authentication straightforward.",
      "Mutations use httpOnly session cookies that the browser sends automatically. Every mutating route handler verifies that the request origin matches the application origin via the security module in src/server/security/. This same-origin check replaces traditional CSRF tokens and works reliably across modern browsers.",
    ],
    serverFirst: [
      "All business logic lives in src/server/. Server modules are pure functions that accept validated inputs, interact with the database through Prisma, and return typed results. They never depend on React, the DOM, or any client-side API.",
      "Hooks in src/hooks/ and client helpers in src/lib/ are intentionally thin adapters. They serialize requests, call API endpoints, and parse responses, but they do not contain business rules, validation logic, or direct database access.",
      "When extending the engine, always start by adding logic to the appropriate server module. Create or update the Zod contract, implement the server function, wire it into a route handler, and only then build the client helper and UI. This order ensures that business rules are tested and enforced server-side before any client code exists.",
    ],
    contractBoundary: [
      "Zod schemas in src/shared/contracts/ are the single source of truth for data shapes. Every request body is validated against a DTO schema in the route handler before reaching business logic. Every response is shaped by the same contracts that client helpers use to parse API responses.",
      "This shared contract layer prevents shape drift between the API and UI. When a field is added or renamed, the schema change propagates type errors to both the server handler and the client helper at compile time, ensuring they stay in sync without manual coordination.",
    ],
  },
  importPatterns: `// Correct: import business logic from server modules
import { placeOrder } from "@/server/orders";

// Correct: import validation schemas from contracts
import { PlaceOrderDto } from "@/shared/contracts";

// Correct: import fetch helpers from client libs
import { fetchOrders } from "@/lib/orders/client";

// Wrong: importing server code into client components
// import { placeOrder } from "@/server/orders"; // in a "use client" file`,
} as const;
