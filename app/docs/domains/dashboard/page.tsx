import type { Metadata } from "next";

import { DocsDomainPage } from "@/components/docs/docs-domain-page";
import {
  dashboardMetadata,
  dashboardPageContent,
} from "@/content/docs/domains/dashboard";

export const metadata: Metadata = dashboardMetadata;

export default function DashboardPage() {
  return <DocsDomainPage content={dashboardPageContent} />;
}
