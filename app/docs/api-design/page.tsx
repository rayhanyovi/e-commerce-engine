import type { Metadata } from "next";

import { DocsCodeBlock } from "@/components/docs/docs-code-block";
import { DocsPageHeader } from "@/components/docs/docs-page-header";
import { DocsPreviousNext } from "@/components/docs/docs-previous-next";
import { DocsSection } from "@/components/docs/docs-section";
import {
  apiDesignMetadata,
  apiDesignPageContent,
} from "@/content/docs/api-design";

export const metadata: Metadata = apiDesignMetadata;

export default function ApiDesignPage() {
  return (
    <>
      <DocsPageHeader
        eyebrow={apiDesignPageContent.eyebrow}
        title={apiDesignPageContent.title}
        description={apiDesignPageContent.description}
      />

      <DocsSection id="envelope" title="Response Envelope">
        <p className="mb-6 text-secondary-foreground">
          {apiDesignPageContent.envelopeIntro}
        </p>

        <DocsCodeBlock
          title="Success Response"
          language="json"
          code={apiDesignPageContent.successResponse}
        />

        <DocsCodeBlock
          title="Error Response"
          language="json"
          code={apiDesignPageContent.errorResponse}
        />
      </DocsSection>

      <DocsSection id="error-codes" title="Error Codes">
        <p className="mb-6 text-secondary-foreground">
          {apiDesignPageContent.errorCodesIntro}
        </p>

        <div className="overflow-x-auto rounded-[1.5rem] border border-border">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="px-4 py-3 font-medium text-muted">Code</th>
                <th className="px-4 py-3 font-medium text-muted">Meaning</th>
              </tr>
            </thead>
            <tbody>
              {apiDesignPageContent.errorCodes.map((entry) => (
                <tr
                  key={entry.code}
                  className="border-b border-border last:border-b-0"
                >
                  <td className="px-4 py-3">
                    <code className="rounded bg-secondary px-1.5 py-0.5 text-xs font-medium">
                      {entry.code}
                    </code>
                  </td>
                  <td className="px-4 py-3">{entry.meaning}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DocsSection>

      <DocsSection id="pagination" title="Pagination">
        {apiDesignPageContent.pagination.map((paragraph) => (
          <p key={paragraph} className="text-secondary-foreground">
            {paragraph}
          </p>
        ))}
      </DocsSection>

      <DocsSection id="auth-model" title="Authentication Model">
        {apiDesignPageContent.authModel.map((paragraph) => (
          <p key={paragraph} className="text-secondary-foreground">
            {paragraph}
          </p>
        ))}
      </DocsSection>

      <DocsPreviousNext currentHref="/docs/api-design" />
    </>
  );
}
