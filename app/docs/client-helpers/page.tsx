import type { Metadata } from "next";

import { DocsCodeBlock } from "@/components/docs/docs-code-block";
import { DocsPageHeader } from "@/components/docs/docs-page-header";
import { DocsPreviousNext } from "@/components/docs/docs-previous-next";
import { DocsSection, DocsSubsection } from "@/components/docs/docs-section";
import {
  clientHelpersMetadata,
  clientHelpersPageContent,
} from "@/content/docs/client-helpers";

export const metadata: Metadata = clientHelpersMetadata;

function toId(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function ClientHelpersPage() {
  return (
    <>
      <DocsPageHeader
        eyebrow={clientHelpersPageContent.eyebrow}
        title={clientHelpersPageContent.title}
        description={clientHelpersPageContent.description}
      />

      <DocsSection id="overview" title="Overview">
        <p>{clientHelpersPageContent.overview}</p>
        <DocsCodeBlock
          code={clientHelpersPageContent.example.code}
          language={clientHelpersPageContent.example.language}
          title={clientHelpersPageContent.example.title}
        />
      </DocsSection>

      <DocsSection id="helper-groups" title="Helper Groups">
        {clientHelpersPageContent.helpers.map((helper) => (
          <DocsSubsection key={helper.title} id={toId(helper.title)} title={helper.title}>
            <p>
              <strong>Path:</strong> <code>{helper.path}</code>
            </p>
            <p>{helper.summary}</p>
            <ul className="space-y-2 text-sm leading-7 text-muted">
              {helper.functions.map((fn) => (
                <li key={fn}>
                  <code>{fn}</code>
                </li>
              ))}
            </ul>
          </DocsSubsection>
        ))}
      </DocsSection>

      <DocsPreviousNext currentHref="/docs/client-helpers" />
    </>
  );
}
