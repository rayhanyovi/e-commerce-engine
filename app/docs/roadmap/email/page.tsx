import type { Metadata } from "next";

import { DocsComingSoonPage } from "@/components/docs/docs-coming-soon-page";
import { DocsPreviousNext } from "@/components/docs/docs-previous-next";
import {
  emailRoadmapContent,
  emailRoadmapMetadata,
} from "@/content/docs/roadmap/email";

export const metadata: Metadata = emailRoadmapMetadata;

export default function EmailNotificationsPage() {
  return (
    <div>
      <DocsComingSoonPage
        title={emailRoadmapContent.title}
        description={emailRoadmapContent.description}
        proposedArchitecture={emailRoadmapContent.proposedArchitecture}
      />
      <DocsPreviousNext currentHref="/docs/roadmap/email" />
    </div>
  );
}
