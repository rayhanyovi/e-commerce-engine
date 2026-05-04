import type { Metadata } from "next";

import { DocsCallout } from "@/components/docs/docs-callout";
import { DocsCodeBlock } from "@/components/docs/docs-code-block";
import { DocsPageHeader } from "@/components/docs/docs-page-header";
import { DocsPreviousNext } from "@/components/docs/docs-previous-next";
import { DocsSection, DocsSubsection } from "@/components/docs/docs-section";
import {
  contractsMetadata,
  contractsPageContent,
} from "@/content/docs/contracts";

export const metadata: Metadata = contractsMetadata;

function toId(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function ContractsPage() {
  return (
    <>
      <DocsPageHeader
        eyebrow={contractsPageContent.eyebrow}
        title={contractsPageContent.title}
        description={contractsPageContent.description}
      />

      <DocsSection id="overview" title="Overview">
        <p>{contractsPageContent.overview}</p>
        <DocsCallout variant="tip" title="Use Shared Contracts End-to-End">
          {contractsPageContent.tip}
        </DocsCallout>
      </DocsSection>

      <DocsSection id="api-envelope" title="API Envelope">
        <DocsCodeBlock
          language="json"
          title="Success envelope example"
          code={contractsPageContent.envelopeExample}
        />
        <DocsCodeBlock
          language="typescript"
          title="Envelope interfaces"
          code={contractsPageContent.envelopeInterfaces}
        />
      </DocsSection>

      <DocsSection id="contract-groups" title="Contract Groups">
        {contractsPageContent.groups.map((group) => (
          <DocsSubsection key={group.title} id={toId(group.title)} title={group.title}>
            <p>
              <strong>Path:</strong> <code>{group.path}</code>
            </p>
            <p>{group.summary}</p>
            <ul className="space-y-2 text-sm leading-7 text-muted">
              {group.items.map((item) => (
                <li key={item}>
                  <code>{item}</code>
                </li>
              ))}
            </ul>
          </DocsSubsection>
        ))}
      </DocsSection>

      <DocsPreviousNext currentHref="/docs/contracts" />
    </>
  );
}
