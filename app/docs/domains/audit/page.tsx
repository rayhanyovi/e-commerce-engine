import type { Metadata } from "next";

import { DocsDomainPage } from "@/components/docs/docs-domain-page";
import { auditMetadata, auditPageContent } from "@/content/docs/domains/audit";

export const metadata: Metadata = auditMetadata;

export default function AuditPage() {
  return <DocsDomainPage content={auditPageContent} />;
}
