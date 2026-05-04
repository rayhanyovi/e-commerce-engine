import type { Metadata } from "next";

import { DocsPageHeader } from "@/components/docs/docs-page-header";
import { DocsPreviousNext } from "@/components/docs/docs-previous-next";
import { DocsSection, DocsSubsection } from "@/components/docs/docs-section";
import {
  domainHelpersMetadata,
  domainHelpersPageContent,
} from "@/content/docs/domain-helpers";

export const metadata: Metadata = domainHelpersMetadata;

function toId(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function DomainHelpersPage() {
  return (
    <>
      <DocsPageHeader
        eyebrow={domainHelpersPageContent.eyebrow}
        title={domainHelpersPageContent.title}
        description={domainHelpersPageContent.description}
      />

      <DocsSection id="overview" title="Overview">
        <p>{domainHelpersPageContent.overview}</p>
      </DocsSection>

      <DocsSection id="helpers" title="Helpers">
        {domainHelpersPageContent.helpers.map((helper) => (
          <DocsSubsection key={helper.name} id={toId(helper.name)} title={helper.name}>
            <p>
              <strong>Signature:</strong> <code>{helper.signature}</code>
            </p>
            <p>{helper.notes}</p>
          </DocsSubsection>
        ))}
      </DocsSection>

      <DocsPreviousNext currentHref="/docs/domain-helpers" />
    </>
  );
}
