import type { Metadata } from "next";

import { DocsCallout } from "@/components/docs/docs-callout";
import { DocsPageHeader } from "@/components/docs/docs-page-header";
import { DocsPreviousNext } from "@/components/docs/docs-previous-next";
import { DocsSection } from "@/components/docs/docs-section";
import {
  dataModelMetadata,
  dataModelPageContent,
} from "@/content/docs/data-model";

export const metadata: Metadata = dataModelMetadata;

export default function DataModelPage() {
  return (
    <>
      <DocsPageHeader
        eyebrow={dataModelPageContent.eyebrow}
        title={dataModelPageContent.title}
        description={dataModelPageContent.description}
      />

      <DocsSection id="core-entities" title="Core Entities">
        <p className="mb-6 text-secondary-foreground">
          {dataModelPageContent.overview}
        </p>

        {dataModelPageContent.entities.map((entity) => (
          <div key={entity.title} className="mb-8">
            <h3 className="mb-3 text-lg font-semibold">{entity.title}</h3>
            <p className="mb-4 text-secondary-foreground">
              {entity.description}
            </p>
            <div className="overflow-x-auto rounded-[1.5rem] border border-border">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    <th className="px-4 py-3 font-medium text-muted">Field</th>
                    <th className="px-4 py-3 font-medium text-muted">Type</th>
                    <th className="px-4 py-3 font-medium text-muted">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {entity.fields.map((field) => (
                    <tr
                      key={field.name}
                      className="border-b border-border last:border-b-0"
                    >
                      <td className="px-4 py-3">
                        <code className="rounded bg-secondary px-1.5 py-0.5 text-xs font-medium">
                          {field.name}
                        </code>
                      </td>
                      <td className="px-4 py-3">{field.type}</td>
                      <td className="px-4 py-3">{field.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </DocsSection>

      <DocsSection id="enums" title="Enums">
        <p className="mb-6 text-secondary-foreground">
          {dataModelPageContent.enumsIntro}
        </p>

        <div className="overflow-x-auto rounded-[1.5rem] border border-border">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="px-4 py-3 font-medium text-muted">Enum</th>
                <th className="px-4 py-3 font-medium text-muted">Values</th>
                <th className="px-4 py-3 font-medium text-muted">Used By</th>
              </tr>
            </thead>
            <tbody>
              {dataModelPageContent.enums.map((entry) => (
                <tr
                  key={entry.name}
                  className="border-b border-border last:border-b-0"
                >
                  <td className="px-4 py-3">
                    <code className="rounded bg-secondary px-1.5 py-0.5 text-xs font-medium">
                      {entry.name}
                    </code>
                  </td>
                  <td className="px-4 py-3">{entry.values}</td>
                  <td className="px-4 py-3">{entry.usedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DocsSection>

      <DocsSection id="design-decisions" title="Design Decisions">
        {dataModelPageContent.designDecisions.map((decision) => (
          <p key={decision.title} className="text-secondary-foreground">
            <strong>{decision.title}</strong> {decision.body}
          </p>
        ))}
      </DocsSection>

      <DocsCallout variant="info" title={dataModelPageContent.calloutTitle}>
        {dataModelPageContent.calloutBody}
      </DocsCallout>

      <DocsPreviousNext currentHref="/docs/data-model" />
    </>
  );
}
