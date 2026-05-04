import type { Metadata } from "next";

import { DocsCodeBlock } from "@/components/docs/docs-code-block";
import { DocsFlowDiagram } from "@/components/docs/docs-flow-diagram";
import { DocsPageHeader } from "@/components/docs/docs-page-header";
import { DocsPreviousNext } from "@/components/docs/docs-previous-next";
import { DocsSection } from "@/components/docs/docs-section";
import {
  architectureMetadata,
  architecturePageContent,
} from "@/content/docs/architecture";

export const metadata: Metadata = architectureMetadata;

export default function ArchitecturePage() {
  return (
    <>
      <DocsPageHeader
        eyebrow={architecturePageContent.eyebrow}
        title={architecturePageContent.title}
        description={architecturePageContent.description}
      />

      <DocsFlowDiagram
        title={architecturePageContent.diagramTitle}
        diagram={architecturePageContent.diagram}
      />

      <DocsSection id="same-origin" title="Same-Origin Architecture">
        {architecturePageContent.sections.sameOrigin.map((paragraph) => (
          <p key={paragraph} className="text-secondary-foreground">
            {paragraph}
          </p>
        ))}
      </DocsSection>

      <DocsSection id="server-first" title="Server-First Philosophy">
        {architecturePageContent.sections.serverFirst.map((paragraph) => (
          <p key={paragraph} className="text-secondary-foreground">
            {paragraph}
          </p>
        ))}
      </DocsSection>

      <DocsSection id="contract-boundary" title="Contract Boundary">
        {architecturePageContent.sections.contractBoundary.map((paragraph) => (
          <p key={paragraph} className="text-secondary-foreground">
            {paragraph}
          </p>
        ))}
      </DocsSection>

      <DocsCodeBlock
        title="Import Patterns"
        language="typescript"
        code={architecturePageContent.importPatterns}
      />

      <DocsPreviousNext currentHref="/docs/architecture" />
    </>
  );
}
