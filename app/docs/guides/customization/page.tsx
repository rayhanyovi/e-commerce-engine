import type { Metadata } from "next";

import { DocsCallout } from "@/components/docs/docs-callout";
import { DocsCodeBlock } from "@/components/docs/docs-code-block";
import { DocsPageHeader } from "@/components/docs/docs-page-header";
import { DocsPreviousNext } from "@/components/docs/docs-previous-next";
import { DocsSection } from "@/components/docs/docs-section";
import {
  customizationMetadata,
  customizationPageContent,
} from "@/content/docs/guides/customization";

export const metadata: Metadata = customizationMetadata;

export default function CustomizationPage() {
  return (
    <div>
      <DocsPageHeader
        eyebrow={customizationPageContent.eyebrow}
        title={customizationPageContent.title}
        description={customizationPageContent.description}
      />

      <DocsSection id="theme" title="Theme Customization">
        {customizationPageContent.theme.map((paragraph) => (
          <p key={paragraph} className="text-sm leading-7 text-muted">
            {paragraph}
          </p>
        ))}

        <DocsCodeBlock
          language="css"
          title="Theme Override Example"
          code={customizationPageContent.themeCode}
        />
      </DocsSection>

      <DocsSection id="components" title="Component Replacement">
        {customizationPageContent.components.map((paragraph) => (
          <p key={paragraph} className="text-sm leading-7 text-muted">
            {paragraph}
          </p>
        ))}
      </DocsSection>

      <DocsSection id="new-domain" title="Adding a New Domain">
        <p className="text-sm leading-7 text-muted">
          {customizationPageContent.newDomainIntro}
        </p>
        <ol className="mt-3 list-inside list-decimal space-y-2 text-sm leading-7 text-muted">
          {customizationPageContent.newDomainSteps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </DocsSection>

      <DocsCallout variant="warning">
        {customizationPageContent.warning}
      </DocsCallout>

      <DocsPreviousNext currentHref="/docs/guides/customization" />
    </div>
  );
}
