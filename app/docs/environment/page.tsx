import type { Metadata } from "next";

import { DocsCallout } from "@/components/docs/docs-callout";
import { DocsCodeBlock } from "@/components/docs/docs-code-block";
import { DocsPageHeader } from "@/components/docs/docs-page-header";
import { DocsPreviousNext } from "@/components/docs/docs-previous-next";
import { DocsSection } from "@/components/docs/docs-section";
import {
  environmentMetadata,
  environmentPageContent,
} from "@/content/docs/environment";

export const metadata: Metadata = environmentMetadata;

export default function EnvironmentPage() {
  return (
    <>
      <DocsPageHeader
        eyebrow={environmentPageContent.eyebrow}
        title={environmentPageContent.title}
        description={environmentPageContent.description}
      />

      <DocsSection id="variables" title="Configuration Reference">
        <p className="mb-6 text-secondary-foreground">
          {environmentPageContent.intro}
        </p>

        <div className="overflow-x-auto rounded-[1.5rem] border border-border">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="px-4 py-3 font-medium text-muted">Variable</th>
                <th className="px-4 py-3 font-medium text-muted">Required</th>
                <th className="px-4 py-3 font-medium text-muted">Default</th>
                <th className="px-4 py-3 font-medium text-muted">Notes</th>
              </tr>
            </thead>
            <tbody>
              {environmentPageContent.variables.map((variable) => (
                <tr
                  key={variable.name}
                  className="border-b border-border last:border-b-0"
                >
                  <td className="px-4 py-3">
                    <code className="rounded bg-secondary px-1.5 py-0.5 text-xs font-medium">
                      {variable.name}
                    </code>
                  </td>
                  <td className="px-4 py-3">
                    {variable.required ? "Yes" : "No"}
                  </td>
                  <td className="px-4 py-3 text-xs">{variable.defaultValue}</td>
                  <td className="px-4 py-3">{variable.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DocsSection>

      <DocsCodeBlock
        title="Sample .env.local"
        language="bash"
        code={environmentPageContent.sampleEnv}
      />

      <DocsCallout
        variant="warning"
        title={environmentPageContent.warningTitle}
      >
        {environmentPageContent.warningBody}
      </DocsCallout>

      <DocsPreviousNext currentHref="/docs/environment" />
    </>
  );
}
