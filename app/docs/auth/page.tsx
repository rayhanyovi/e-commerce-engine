import type { Metadata } from "next";

import { DocsCodeBlock } from "@/components/docs/docs-code-block";
import { DocsFlowDiagram } from "@/components/docs/docs-flow-diagram";
import { DocsPageHeader } from "@/components/docs/docs-page-header";
import { DocsPreviousNext } from "@/components/docs/docs-previous-next";
import { DocsSection } from "@/components/docs/docs-section";
import { authMetadata, authPageContent } from "@/content/docs/auth";

export const metadata: Metadata = authMetadata;

export default function AuthPage() {
  return (
    <>
      <DocsPageHeader
        eyebrow={authPageContent.eyebrow}
        title={authPageContent.title}
        description={authPageContent.description}
      />

      <DocsSection id="overview" title="Overview">
        {authPageContent.overview.map((paragraph) => (
          <p key={paragraph} className="text-secondary-foreground">
            {paragraph}
          </p>
        ))}
      </DocsSection>

      <DocsSection id="guards" title="Server Guards">
        <p className="mb-4 text-secondary-foreground">
          {authPageContent.guardsIntro}
        </p>
        <ul className="mb-6 list-inside list-disc space-y-2 text-secondary-foreground">
          {authPageContent.guards.map((guard) => (
            <li key={guard.name}>
              <strong>{guard.name}</strong> - {guard.summary}
            </li>
          ))}
        </ul>

        <DocsCodeBlock
          title="Using Guards in Route Handlers"
          language="typescript"
          code={authPageContent.guardsCode}
        />
      </DocsSection>

      <DocsSection id="registration" title="Registration Flow">
        {authPageContent.registration.map((paragraph) => (
          <p key={paragraph} className="text-secondary-foreground">
            {paragraph}
          </p>
        ))}
      </DocsSection>

      <DocsSection id="login" title="Login Flow">
        {authPageContent.login.map((paragraph) => (
          <p key={paragraph} className="text-secondary-foreground">
            {paragraph}
          </p>
        ))}
      </DocsSection>

      <DocsSection id="roles" title="Role System">
        {authPageContent.roles.map((paragraph) => (
          <p key={paragraph} className="text-secondary-foreground">
            {paragraph}
          </p>
        ))}
      </DocsSection>

      <DocsFlowDiagram
        title={authPageContent.flowTitle}
        diagram={authPageContent.flowDiagram}
      />

      <DocsPreviousNext currentHref="/docs/auth" />
    </>
  );
}
