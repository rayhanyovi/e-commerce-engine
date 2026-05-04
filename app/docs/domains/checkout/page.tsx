import type { Metadata } from "next";

import { DocsDomainPage } from "@/components/docs/docs-domain-page";
import {
  checkoutMetadata,
  checkoutPageContent,
} from "@/content/docs/domains/checkout";

export const metadata: Metadata = checkoutMetadata;

export default function CheckoutPage() {
  return <DocsDomainPage content={checkoutPageContent} />;
}
