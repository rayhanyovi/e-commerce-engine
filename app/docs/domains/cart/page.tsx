import type { Metadata } from "next";

import { DocsDomainPage } from "@/components/docs/docs-domain-page";
import { cartMetadata, cartPageContent } from "@/content/docs/domains/cart";

export const metadata: Metadata = cartMetadata;

export default function CartPage() {
  return <DocsDomainPage content={cartPageContent} />;
}
