import type { Metadata } from "next";

import { DocsCodeBlock } from "@/components/docs/docs-code-block";
import { DocsPageHeader } from "@/components/docs/docs-page-header";
import { DocsPreviousNext } from "@/components/docs/docs-previous-next";
import { DocsSection } from "@/components/docs/docs-section";
import {
  errorHandlingMetadata,
  errorHandlingPageContent,
} from "@/content/docs/error-handling";

export const metadata: Metadata = errorHandlingMetadata;

export default function ErrorHandlingPage() {
  return (
    <>
      <DocsPageHeader
        eyebrow={errorHandlingPageContent.eyebrow}
        title={errorHandlingPageContent.title}
        description={errorHandlingPageContent.description}
      />

      <DocsSection id="overview" title="Overview">
        <p>{errorHandlingPageContent.overview}</p>
      </DocsSection>

      <DocsSection id="error-envelope" title="Error Envelope">
        <DocsCodeBlock
          language="typescript"
          title="ApiErrorResponse and helpers"
          code={errorHandlingPageContent.envelopeCode}
        />
        <p>{errorHandlingPageContent.envelopeNotes}</p>
      </DocsSection>

      <DocsSection id="error-codes" title="Error Codes">
        <p>
          The shared registry currently exports the following identifiers from{" "}
          <code>{errorHandlingPageContent.errorCodePath}</code>:
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {errorHandlingPageContent.errorCodes.map((code) => (
            <div
              key={code}
              className="rounded-[1.25rem] border border-border bg-background/75 px-4 py-3"
            >
              <code>{code}</code>
            </div>
          ))}
        </div>
      </DocsSection>

      <DocsSection id="practical-guidance" title="Practical Guidance">
        <ul className="space-y-3 text-sm leading-7 text-muted">
          {errorHandlingPageContent.guidance.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </DocsSection>

      <DocsPreviousNext currentHref="/docs/error-handling" />
    </>
  );
}
