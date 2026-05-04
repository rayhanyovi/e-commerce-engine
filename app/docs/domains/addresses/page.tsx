import type { Metadata } from "next";

import { DocsDomainPage } from "@/components/docs/docs-domain-page";
import {
  addressesMetadata,
  addressesPageContent,
} from "@/content/docs/domains/addresses";

export const metadata: Metadata = addressesMetadata;

export default function AddressesPage() {
  return <DocsDomainPage content={addressesPageContent} />;
}
