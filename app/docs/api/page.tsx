import type { Metadata } from "next";

import { DocsCard } from "@/components/docs/docs-card";
import { DocsCodeBlock } from "@/components/docs/docs-code-block";
import { DocsPageHeader } from "@/components/docs/docs-page-header";
import { DocsPreviousNext } from "@/components/docs/docs-previous-next";
import { DocsRouteTable } from "@/components/docs/docs-route-table";
import { DocsSection } from "@/components/docs/docs-section";
import {
  apiOverviewMetadata,
  apiOverviewPageContent,
} from "@/content/docs/api/overview";

export const metadata: Metadata = apiOverviewMetadata;

export default function ApiOverviewPage() {
  return (
    <>
      <DocsPageHeader
        eyebrow={apiOverviewPageContent.eyebrow}
        title={apiOverviewPageContent.title}
        description={apiOverviewPageContent.description}
      />

      <DocsSection id="overview" title="Overview">
        <p>{apiOverviewPageContent.overview[0]}</p>
        <DocsCodeBlock
          language="typescript"
          title="ApiEnvelope<T>"
          code={apiOverviewPageContent.envelopeCode}
        />
        <p>{apiOverviewPageContent.overview[1]}</p>
      </DocsSection>

      <DocsSection id="access-tiers" title="Access Tiers">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {apiOverviewPageContent.accessTiers.map((tier) => (
            <DocsCard key={tier.title} {...tier} />
          ))}
        </div>
      </DocsSection>

      <DocsSection id="quick-reference" title="Quick Reference">
        <p>{apiOverviewPageContent.quickReferenceIntro}</p>
        <DocsRouteTable endpoints={[...apiOverviewPageContent.quickReference]} />
      </DocsSection>

      <DocsPreviousNext currentHref="/docs/api" />
    </>
  );
}
