import type { Metadata } from "next";

import { DocsCard } from "@/components/docs/docs-card";
import { DocsCodeBlock } from "@/components/docs/docs-code-block";
import { DocsPageHeader } from "@/components/docs/docs-page-header";
import { DocsPreviousNext } from "@/components/docs/docs-previous-next";
import { DocsSection } from "@/components/docs/docs-section";
import {
  projectStructureMetadata,
  projectStructurePageContent,
} from "@/content/docs/project-structure";

export const metadata: Metadata = projectStructureMetadata;

export default function ProjectStructurePage() {
  return (
    <>
      <DocsPageHeader
        eyebrow={projectStructurePageContent.eyebrow}
        title={projectStructurePageContent.title}
        description={projectStructurePageContent.description}
      />

      <DocsCodeBlock
        title="Directory Structure"
        language="text"
        code={projectStructurePageContent.directoryTree}
      />

      <DocsSection id="layers" title="Engine Layers">
        <p className="mb-6 text-secondary-foreground">
          {projectStructurePageContent.layersIntro}
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          {projectStructurePageContent.layers.map((layer) => (
            <DocsCard key={layer.title} {...layer} />
          ))}
        </div>
      </DocsSection>

      <DocsPreviousNext currentHref="/docs/project-structure" />
    </>
  );
}
