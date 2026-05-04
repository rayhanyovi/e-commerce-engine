import type { Metadata } from "next";

import { DocsComingSoonPage } from "@/components/docs/docs-coming-soon-page";
import { DocsPreviousNext } from "@/components/docs/docs-previous-next";
import {
  webhooksRoadmapContent,
  webhooksRoadmapMetadata,
} from "@/content/docs/roadmap/webhooks";

export const metadata: Metadata = webhooksRoadmapMetadata;

export default function WebhooksPage() {
  return (
    <div>
      <DocsComingSoonPage
        title={webhooksRoadmapContent.title}
        description={webhooksRoadmapContent.description}
        proposedArchitecture={webhooksRoadmapContent.proposedArchitecture}
      />
      <DocsPreviousNext currentHref="/docs/roadmap/webhooks" />
    </div>
  );
}
