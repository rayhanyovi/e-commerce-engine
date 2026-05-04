import type { Metadata } from "next";

import { DocsDomainPage } from "@/components/docs/docs-domain-page";
import {
  promotionsMetadata,
  promotionsPageContent,
} from "@/content/docs/domains/promotions";

export const metadata: Metadata = promotionsMetadata;

export default function PromotionsPage() {
  return <DocsDomainPage content={promotionsPageContent} />;
}
