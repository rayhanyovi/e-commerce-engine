import type { Metadata } from "next";

import { DocsCallout } from "@/components/docs/docs-callout";
import { DocsCodeBlock } from "@/components/docs/docs-code-block";
import { DocsPageHeader } from "@/components/docs/docs-page-header";
import { DocsPreviousNext } from "@/components/docs/docs-previous-next";
import { DocsSteps } from "@/components/docs/docs-steps";
import {
  quickstartMetadata,
  quickstartPageContent,
} from "@/content/docs/quickstart";

export const metadata: Metadata = quickstartMetadata;

export default function QuickstartPage() {
  return (
    <>
      <DocsPageHeader
        eyebrow={quickstartPageContent.eyebrow}
        title={quickstartPageContent.title}
        description={quickstartPageContent.description}
      />

      <DocsSteps steps={[...quickstartPageContent.steps]} />

      <DocsCodeBlock
        title="Full Quickstart Sequence"
        language="bash"
        code={quickstartPageContent.fullCommand}
      />

      <DocsCallout variant="tip" title={quickstartPageContent.adminCalloutTitle}>
        {quickstartPageContent.adminCalloutBody}
      </DocsCallout>

      <DocsPreviousNext currentHref="/docs/quickstart" />
    </>
  );
}
