import type { Metadata } from "next";

import { DeveloperDocsPage } from "@/components/docs/developer-docs-page";

export const metadata: Metadata = {
  title: "Developer Docs | E-Commerce Engine",
  description:
    "Public developer reference for the Next.js ecommerce engine covering APIs, server modules, hooks, shared contracts, and integration patterns.",
};

export default function DocsPage() {
  return <DeveloperDocsPage />;
}
