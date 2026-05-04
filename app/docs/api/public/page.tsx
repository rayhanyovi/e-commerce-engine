import type { Metadata } from "next";

import { DocsCodeBlock } from "@/components/docs/docs-code-block";
import { DocsPageHeader } from "@/components/docs/docs-page-header";
import { DocsPreviousNext } from "@/components/docs/docs-previous-next";
import { DocsRouteTable } from "@/components/docs/docs-route-table";
import { DocsSection } from "@/components/docs/docs-section";
import {
  publicApisMetadata,
  publicApisPageContent,
} from "@/content/docs/api/public";

export const metadata: Metadata = publicApisMetadata;

export default function PublicApisPage() {
  return (
    <>
      <DocsPageHeader
        eyebrow={publicApisPageContent.eyebrow}
        title={publicApisPageContent.title}
        description={publicApisPageContent.description}
      />

      <DocsSection id="overview" title="Overview">
        <p>{publicApisPageContent.overview}</p>
      </DocsSection>

      <DocsSection id="endpoints" title="Endpoints">
        <DocsRouteTable endpoints={[...publicApisPageContent.endpoints]} />
      </DocsSection>

      {publicApisPageContent.sections.map((section) => (
        <DocsSection key={section.id} id={section.id} title={section.title}>
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          {section.codeBlocks.map((codeBlock) => (
            <DocsCodeBlock
              key={codeBlock.title}
              language={codeBlock.language}
              title={codeBlock.title}
              code={codeBlock.code}
            />
          ))}
        </DocsSection>
      ))}

      <DocsPreviousNext currentHref="/docs/api/public" />
    </>
  );
}
