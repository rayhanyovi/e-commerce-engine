import type { Metadata } from "next";

export const customizationMetadata: Metadata = {
  title: "Customization | E-Commerce Engine Docs",
  description:
    "Customize the engine's theme, components, and domain logic for your storefront.",
};

export const customizationPageContent = {
  eyebrow: "Guides",
  title: "Customization",
  description:
    "How to customize the engine's theme, replace components, add new domains, and extend existing functionality.",
  theme: [
    "The design system is driven by CSS custom properties in app/globals.css. Override these variables to change the entire look and feel without touching component code.",
    "Both light and dark mode use the same variable names. Override the dark-mode block separately when you need a different nighttime palette.",
  ],
  themeCode: `:root {
  --accent: #2563eb;
  --accent-strong: #1d4ed8;
  --background: #fafafa;
  --surface: #ffffff;
  --border: #e5e7eb;
  --muted: #6b7280;

  --sidebar-background: #f8fafc;
  --sidebar-primary: #2563eb;
  --sidebar-accent: #eff6ff;
}`,
  components: [
    "Storefront components in src/components/storefront/ are the presentation layer. Replace them freely because they consume server modules and client helpers through shared contracts. The engine does not depend on specific component implementations.",
    "Admin components in src/components/admin/ can also be replaced, but changes there are typically less frequent because admin surfaces are operational rather than branded.",
  ],
  newDomainIntro:
    "To add a new commerce domain such as wishlists or reviews, follow the engine layering pattern instead of jumping directly into UI work.",
  newDomainSteps: [
    "Add the Prisma model to prisma/schema.prisma and run npm run db:migrate.",
    "Create a server module at src/server/your-domain/service.ts with business logic.",
    "Add Zod schemas at src/shared/contracts/dto/your-domain.dto.ts.",
    "Create route handlers at app/api/your-domain/route.ts.",
    "Add client helpers at src/lib/your-domain/client.ts.",
    "Build UI components that consume those helpers.",
  ],
  warning:
    "When extending the engine, add logic to server modules first. Do not put business rules in components, hooks, or client helpers because those layers should stay thin.",
} as const;
