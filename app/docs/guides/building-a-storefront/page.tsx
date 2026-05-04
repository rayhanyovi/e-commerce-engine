import type { Metadata } from "next";

import { DocsCallout } from "@/components/docs/docs-callout";
import { DocsCodeBlock } from "@/components/docs/docs-code-block";
import { DocsPageHeader } from "@/components/docs/docs-page-header";
import { DocsPreviousNext } from "@/components/docs/docs-previous-next";
import { DocsSection } from "@/components/docs/docs-section";
import { DocsSteps } from "@/components/docs/docs-steps";
import {
  buildingAStorefrontMetadata,
  buildingAStorefrontPageContent,
} from "@/content/docs/guides/building-a-storefront";

export const metadata: Metadata = buildingAStorefrontMetadata;

export default function BuildingAStorefrontPage() {
  return (
    <div>
      <DocsPageHeader
        eyebrow={buildingAStorefrontPageContent.eyebrow}
        title={buildingAStorefrontPageContent.title}
        description={buildingAStorefrontPageContent.description}
      />

      <DocsSection id="approach" title="Approach">
        {buildingAStorefrontPageContent.approach.map((paragraph) => (
          <p key={paragraph} className="text-sm leading-7 text-muted">
            {paragraph}
          </p>
        ))}
      </DocsSection>

      <DocsSection id="steps" title="Step by Step">
        <DocsSteps steps={[...buildingAStorefrontPageContent.steps]} />
      </DocsSection>

      <DocsSection id="consuming" title="Consuming the Engine">
        {buildingAStorefrontPageContent.consuming.map((paragraph) => (
          <p key={paragraph} className="text-sm leading-7 text-muted">
            {paragraph}
          </p>
        ))}

        {buildingAStorefrontPageContent.examples.map((example) => (
          <DocsCodeBlock
            key={example.title}
            language={example.language}
            title={example.title}
            code={example.code}
          />
        ))}
      </DocsSection>

      <DocsCallout variant="tip">
        {buildingAStorefrontPageContent.callout}
      </DocsCallout>

      <DocsPreviousNext currentHref="/docs/guides/building-a-storefront" />
    </div>
  );
}
