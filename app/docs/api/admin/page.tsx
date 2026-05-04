import type { Metadata } from "next";

import { DocsBadge } from "@/components/docs/docs-badge";
import { DocsPageHeader } from "@/components/docs/docs-page-header";
import { DocsPreviousNext } from "@/components/docs/docs-previous-next";
import { DocsRouteTable } from "@/components/docs/docs-route-table";
import { DocsSection, DocsSubsection } from "@/components/docs/docs-section";
import {
  adminApisMetadata,
  adminApisPageContent,
} from "@/content/docs/api/admin";

export const metadata: Metadata = adminApisMetadata;

function toId(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function AdminApisPage() {
  const adminDomain = adminApisPageContent.domain;

  if (!adminDomain) {
    return null;
  }

  const routeRows = adminDomain.endpoints.flatMap((endpoint) =>
    endpoint.methods.map((method) => ({
      method: method.method,
      path: endpoint.path,
      summary: endpoint.summary,
      access: method.access,
    })),
  );

  return (
    <>
      <DocsPageHeader
        eyebrow={adminApisPageContent.eyebrow}
        title={adminApisPageContent.title}
        description={adminApisPageContent.description}
      />

      <DocsSection id="overview" title="Overview">
        {adminApisPageContent.overview.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </DocsSection>

      <DocsSection id="endpoints" title="Endpoints">
        <DocsRouteTable endpoints={routeRows} />
      </DocsSection>

      <DocsSection id="details" title="Endpoint Details">
        {adminDomain.endpoints.map((endpoint) => (
          <DocsSubsection
            key={endpoint.path}
            id={toId(endpoint.path)}
            title={endpoint.path}
          >
            <p>
              <strong>Source:</strong> <code>{endpoint.source}</code>
            </p>
            <p>{endpoint.summary}</p>
            <div className="space-y-3">
              {endpoint.methods.map((method) => (
                <div
                  key={`${endpoint.path}-${method.method}`}
                  className="rounded-[1.25rem] border border-border bg-background/75 p-4"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <DocsBadge
                      label={method.method}
                      variant={
                        method.method.toLowerCase() as "get" | "post" | "patch" | "delete"
                      }
                    />
                    <DocsBadge
                      label={method.access}
                      variant={
                        method.access.toLowerCase() as "public" | "customer" | "admin"
                      }
                    />
                  </div>
                  <p className="mt-3 text-sm leading-7 text-muted">
                    <strong>Request:</strong> {method.request}
                  </p>
                  <p className="text-sm leading-7 text-muted">
                    <strong>Response:</strong> {method.response}
                  </p>
                  <p className="text-sm leading-7 text-muted">
                    <strong>Notes:</strong> {method.notes}
                  </p>
                </div>
              ))}
            </div>
          </DocsSubsection>
        ))}
      </DocsSection>

      <DocsPreviousNext currentHref="/docs/api/admin" />
    </>
  );
}
