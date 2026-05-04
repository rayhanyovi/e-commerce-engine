import type { Metadata } from "next";

import { DocsComingSoonPage } from "@/components/docs/docs-coming-soon-page";
import { DocsPreviousNext } from "@/components/docs/docs-previous-next";
import {
  paymentAdaptersRoadmapContent,
  paymentAdaptersRoadmapMetadata,
} from "@/content/docs/roadmap/payments";

export const metadata: Metadata = paymentAdaptersRoadmapMetadata;

export default function PaymentAdaptersPage() {
  return (
    <div>
      <DocsComingSoonPage
        title={paymentAdaptersRoadmapContent.title}
        description={paymentAdaptersRoadmapContent.description}
        proposedArchitecture={paymentAdaptersRoadmapContent.proposedArchitecture}
      />
      <DocsPreviousNext currentHref="/docs/roadmap/payments" />
    </div>
  );
}
