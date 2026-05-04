import type { Metadata } from "next";
import Link from "next/link";

import { DocsDomainCard } from "@/components/docs/docs-domain-card";
import { DocsPageHeader } from "@/components/docs/docs-page-header";
import { DocsPreviousNext } from "@/components/docs/docs-previous-next";
import { DocsSection } from "@/components/docs/docs-section";
import { overviewMetadata, overviewPageContent } from "@/content/docs/overview";

export const metadata: Metadata = overviewMetadata;

export default function DocsOverviewPage() {
  return (
    <div>
      <DocsPageHeader
        eyebrow={overviewPageContent.eyebrow}
        title={overviewPageContent.title}
        description={overviewPageContent.description}
      />

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {overviewPageContent.stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-[1.5rem] border border-border bg-background/75 p-4 text-center"
          >
            <p className="text-2xl font-semibold text-foreground">
              {stat.value}
            </p>
            <p className="mt-1 text-xs text-muted">{stat.label}</p>
          </div>
        ))}
      </div>

      <DocsSection id="what-is-this" title="What is this engine?">
        {overviewPageContent.intro.map((paragraph) => (
          <p key={paragraph} className="text-sm leading-7 text-muted">
            {paragraph}
          </p>
        ))}
      </DocsSection>

      <DocsSection id="domains" title="Commerce Domains">
        <p className="text-sm leading-7 text-muted">
          {overviewPageContent.domainsIntro}
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {overviewPageContent.domains.map((domain) => (
            <DocsDomainCard key={domain.href} {...domain} />
          ))}
        </div>
      </DocsSection>

      <DocsSection id="quick-links" title="Quick Links">
        <div className="grid gap-3 sm:grid-cols-3">
          {overviewPageContent.quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-[1.5rem] border border-border bg-background/75 p-5 transition hover:border-accent/40"
            >
              <p className="text-sm font-semibold text-foreground">
                {link.title}
              </p>
              <p className="mt-1 text-xs text-muted">{link.description}</p>
            </Link>
          ))}
        </div>
      </DocsSection>

      <DocsPreviousNext currentHref="/docs" />
    </div>
  );
}
