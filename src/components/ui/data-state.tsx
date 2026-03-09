"use client";

import Link from "next/link";

type DataStateAction = {
  href: string;
  label: string;
  variant?: "primary" | "secondary";
};

export function DataState({
  eyebrow,
  title,
  description,
  tone = "empty",
  size = "default",
  actions,
  extra,
}: {
  eyebrow: string;
  title: string;
  description: string;
  tone?: "empty" | "error";
  size?: "default" | "compact";
  actions?: DataStateAction[];
  extra?: React.ReactNode;
}) {
  const isError = tone === "error";
  const shellClassName =
    size === "compact"
      ? "rounded-[1.5rem] border border-border bg-background p-5"
      : "rounded-[1.75rem] border border-border bg-surface p-8";
  const badgeClassName = isError
    ? "bg-status-danger/15 text-status-danger-foreground"
    : "bg-status-warning/15 text-status-warning-foreground";

  return (
    <section className={shellClassName}>
      <span
        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] ${badgeClassName}`}
      >
        {eyebrow}
      </span>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">{description}</p>

      {actions?.length ? (
        <div className="mt-6 flex flex-wrap gap-3">
          {actions.map((action) => (
            <Link
              key={`${action.href}:${action.label}`}
              href={action.href}
              className={`rounded-full px-5 py-3 text-sm font-medium transition ${
                action.variant === "secondary"
                  ? "border border-border text-muted hover:text-foreground"
                  : "bg-accent text-white hover:bg-accent-strong"
              }`}
            >
              {action.label}
            </Link>
          ))}
        </div>
      ) : null}

      {extra ? <div className="mt-6">{extra}</div> : null}
    </section>
  );
}
