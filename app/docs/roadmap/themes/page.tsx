import type { Metadata } from "next";

import { DocsComingSoonPage } from "@/components/docs/docs-coming-soon-page";
import { DocsPreviousNext } from "@/components/docs/docs-previous-next";
import {
  themesRoadmapContent,
  themesRoadmapMetadata,
} from "@/content/docs/roadmap/themes";

export const metadata: Metadata = themesRoadmapMetadata;

export default function ThemePresetsPage() {
  return (
    <div>
      <DocsComingSoonPage
        title={themesRoadmapContent.title}
        description={themesRoadmapContent.description}
        proposedArchitecture={themesRoadmapContent.proposedArchitecture}
      />
      <DocsPreviousNext currentHref="/docs/roadmap/themes" />
    </div>
  );
}
