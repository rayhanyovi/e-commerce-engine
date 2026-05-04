import Link from "next/link";

import { getNextPage, getPreviousPage } from "@/content/docs/page-registry";

function ArrowLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
      <path
        d="M10 4L6 8l4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
      <path
        d="M6 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function DocsPreviousNext({ currentHref }: { currentHref: string }) {
  const previous = getPreviousPage(currentHref);
  const next = getNextPage(currentHref);

  if (!previous && !next) return null;

  return (
    <div className="mt-12 grid gap-3 sm:grid-cols-2">
      {previous ? (
        <Link
          href={previous.href}
          className="group flex items-center gap-3 rounded-[1.5rem] border border-border bg-background/75 p-5 transition hover:border-accent/40"
        >
          <ArrowLeft />
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-muted">
              Previous
            </p>
            <p className="mt-1 text-sm font-medium text-foreground">
              {previous.title}
            </p>
          </div>
        </Link>
      ) : (
        <div />
      )}
      {next ? (
        <Link
          href={next.href}
          className="group flex items-center justify-end gap-3 rounded-[1.5rem] border border-border bg-background/75 p-5 text-right transition hover:border-accent/40"
        >
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-muted">
              Next
            </p>
            <p className="mt-1 text-sm font-medium text-foreground">
              {next.title}
            </p>
          </div>
          <ArrowRight />
        </Link>
      ) : (
        <div />
      )}
    </div>
  );
}
