import type { Metadata } from "next";

import { DocsCallout } from "@/components/docs/docs-callout";
import { DocsCodeBlock } from "@/components/docs/docs-code-block";
import { DocsPageHeader } from "@/components/docs/docs-page-header";
import { DocsPreviousNext } from "@/components/docs/docs-previous-next";
import { DocsSection } from "@/components/docs/docs-section";
import {
  deploymentGuideMetadata,
  deploymentGuidePageContent,
} from "@/content/docs/guides/deployment";

export const metadata: Metadata = deploymentGuideMetadata;

export default function DeploymentPage() {
  return (
    <div>
      <DocsPageHeader
        eyebrow={deploymentGuidePageContent.eyebrow}
        title={deploymentGuidePageContent.title}
        description={deploymentGuidePageContent.description}
        status={deploymentGuidePageContent.status}
      />

      <DocsSection id="checklist" title="Production Checklist">
        <ul className="list-inside list-disc space-y-2 text-sm leading-7 text-muted">
          {deploymentGuidePageContent.checklist.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </DocsSection>

      <DocsSection id="database" title="Database Migration">
        {deploymentGuidePageContent.database.map((paragraph) => (
          <p key={paragraph} className="text-sm leading-7 text-muted">
            {paragraph}
          </p>
        ))}
        <DocsCodeBlock
          language="bash"
          title="Production Migration"
          code={deploymentGuidePageContent.migrationCommand}
        />
      </DocsSection>

      <DocsSection id="docker" title="Docker">
        {deploymentGuidePageContent.docker.map((paragraph) => (
          <p key={paragraph} className="text-sm leading-7 text-muted">
            {paragraph}
          </p>
        ))}
        <DocsCodeBlock
          language="bash"
          title="Docker Compose"
          code={deploymentGuidePageContent.dockerCommand}
        />
      </DocsSection>

      <DocsSection id="vercel" title="Vercel">
        {deploymentGuidePageContent.vercel.map((paragraph) => (
          <p key={paragraph} className="text-sm leading-7 text-muted">
            {paragraph}
          </p>
        ))}
      </DocsSection>

      <DocsCallout variant="warning">
        {deploymentGuidePageContent.warning}
      </DocsCallout>

      <DocsPreviousNext currentHref="/docs/guides/deployment" />
    </div>
  );
}
