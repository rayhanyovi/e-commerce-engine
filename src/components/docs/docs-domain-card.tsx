import Link from "next/link";

import { DocsStatusPill } from "./docs-status-pill";

export function DocsDomainCard({
  title,
  description,
  href,
  endpointCount,
  status = "stable",
}: {
  title: string;
  description: string;
  href: string;
  endpointCount: number;
  status?: "stable" | "coming-soon";
}) {
  return (
    <Link
      href={href}
      className="flex flex-col justify-between rounded-[1.5rem] border border-border bg-background/75 p-5 transition hover:border-accent/40"
    >
      <div>
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <DocsStatusPill status={status} />
        </div>
        <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
      </div>
      <div className="mt-3">
        <span className="rounded-full border border-border bg-secondary px-2.5 py-1 text-[0.65rem] font-medium text-muted">
          {endpointCount} endpoint{endpointCount !== 1 ? "s" : ""}
        </span>
      </div>
    </Link>
  );
}
