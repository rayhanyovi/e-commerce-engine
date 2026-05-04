import { DocsStatusPill } from "./docs-status-pill";

export function DocsPageHeader({
  eyebrow,
  title,
  description,
  status,
}: {
  eyebrow: string;
  title: string;
  description: string;
  status?: "stable" | "experimental" | "coming-soon";
}) {
  return (
    <div className="max-w-3xl">
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-muted">
          {eyebrow}
        </p>
        {status && <DocsStatusPill status={status} />}
      </div>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        {title}
      </h1>
      <p className="mt-3 text-base leading-8 text-muted">{description}</p>
    </div>
  );
}
