import type { Metadata } from "next";

import { DocsDomainPage } from "@/components/docs/docs-domain-page";
import {
  inventoryMetadata,
  inventoryPageContent,
} from "@/content/docs/domains/inventory";

export const metadata: Metadata = inventoryMetadata;

export default function InventoryPage() {
  return <DocsDomainPage content={inventoryPageContent} />;
}
