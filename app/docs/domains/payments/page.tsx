import type { Metadata } from "next";

import { DocsDomainPage } from "@/components/docs/docs-domain-page";
import {
  paymentsMetadata,
  paymentsPageContent,
} from "@/content/docs/domains/payments";

export const metadata: Metadata = paymentsMetadata;

export default function PaymentsPage() {
  return <DocsDomainPage content={paymentsPageContent} />;
}
