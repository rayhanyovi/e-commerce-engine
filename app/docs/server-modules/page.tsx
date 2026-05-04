import type { Metadata } from "next";

import { DocsCodeBlock } from "@/components/docs/docs-code-block";
import { DocsPageHeader } from "@/components/docs/docs-page-header";
import { DocsPreviousNext } from "@/components/docs/docs-previous-next";
import { DocsSection, DocsSubsection } from "@/components/docs/docs-section";
import {
  serverModulesMetadata,
  serverModulesPageContent,
} from "@/content/docs/server-modules";

export const metadata: Metadata = serverModulesMetadata;

function toId(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function ServerModulesPage() {
  return (
    <>
      <DocsPageHeader
        eyebrow={serverModulesPageContent.eyebrow}
        title={serverModulesPageContent.title}
        description={serverModulesPageContent.description}
      />

      <DocsSection id="overview" title="Overview">
        <p>{serverModulesPageContent.overview}</p>
        <DocsCodeBlock
          code={serverModulesPageContent.example.code}
          language={serverModulesPageContent.example.language}
          title={serverModulesPageContent.example.title}
        />
      </DocsSection>

      <DocsSection id="module-catalog" title={serverModulesPageContent.sectionTitle}>
        {serverModulesPageContent.modules.map((module) => (
          <DocsSubsection key={module.title} id={toId(module.title)} title={module.title}>
            <p>
              <strong>Path:</strong> <code>{module.path}</code>
            </p>
            <p>{module.summary}</p>
            <ul className="space-y-3 text-sm leading-7 text-muted">
              {module.functions.map((fn) => (
                <li key={fn.name}>
                  <strong>{fn.name}</strong>
                  <div>
                    <code>{fn.signature}</code>
                  </div>
                  <div>{fn.notes}</div>
                </li>
              ))}
            </ul>
          </DocsSubsection>
        ))}
      </DocsSection>

      <DocsPreviousNext currentHref="/docs/server-modules" />
    </>
  );
}
