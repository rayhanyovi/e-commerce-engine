import type { Metadata } from "next";

import { DocsComingSoonPage } from "@/components/docs/docs-coming-soon-page";
import { DocsPreviousNext } from "@/components/docs/docs-previous-next";
import {
  shippingRoadmapContent,
  shippingRoadmapMetadata,
} from "@/content/docs/roadmap/shipping";

export const metadata: Metadata = shippingRoadmapMetadata;

export default function ShippingAdaptersPage() {
  return (
    <div>
      <DocsComingSoonPage
        title={shippingRoadmapContent.title}
        description={shippingRoadmapContent.description}
        proposedArchitecture={shippingRoadmapContent.proposedArchitecture}
      />
      <DocsPreviousNext currentHref="/docs/roadmap/shipping" />
    </div>
  );
}
