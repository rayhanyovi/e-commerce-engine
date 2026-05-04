import type { Metadata } from "next";

import { DocsDomainPage } from "@/components/docs/docs-domain-page";
import {
  ordersMetadata,
  ordersPageContent,
} from "@/content/docs/domains/orders";

export const metadata: Metadata = ordersMetadata;

export default function OrdersPage() {
  return <DocsDomainPage content={ordersPageContent} />;
}
