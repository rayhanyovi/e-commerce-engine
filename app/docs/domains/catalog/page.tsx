import type { Metadata } from "next";

import { DocsDomainPage } from "@/components/docs/docs-domain-page";
import {
  catalogMetadata,
  catalogPageContent,
} from "@/content/docs/domains/catalog";

export const metadata: Metadata = catalogMetadata;

export default function CatalogPage() {
  return <DocsDomainPage content={catalogPageContent} />;
}
