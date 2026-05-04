import type { Metadata } from "next";

import { DocsCodeBlock } from "@/components/docs/docs-code-block";
import { DocsPageHeader } from "@/components/docs/docs-page-header";
import { DocsPreviousNext } from "@/components/docs/docs-previous-next";
import { DocsSection, DocsSubsection } from "@/components/docs/docs-section";
import { hooksMetadata, hooksPageContent } from "@/content/docs/hooks";

export const metadata: Metadata = hooksMetadata;

function toId(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function HooksPage() {
  return (
    <>
      <DocsPageHeader
        eyebrow={hooksPageContent.eyebrow}
        title={hooksPageContent.title}
        description={hooksPageContent.description}
      />

      <DocsSection id="overview" title="Overview">
        <p>{hooksPageContent.overview}</p>
        <DocsCodeBlock
          code={hooksPageContent.example.code}
          language={hooksPageContent.example.language}
          title={hooksPageContent.example.title}
        />
      </DocsSection>

      <DocsSection id="hook-reference" title="Hook Reference">
        {hooksPageContent.hooks.map((hook) => (
          <DocsSubsection key={hook.name} id={toId(hook.name)} title={hook.name}>
            <p>
              <strong>Path:</strong> <code>{hook.path}</code>
            </p>
            <p>{hook.summary}</p>
            <ul className="space-y-2 text-sm leading-7 text-muted">
              {hook.returns.map((entry) => (
                <li key={entry}>
                  <code>{entry}</code>
                </li>
              ))}
            </ul>
          </DocsSubsection>
        ))}
      </DocsSection>

      <DocsPreviousNext currentHref="/docs/hooks" />
    </>
  );
}
