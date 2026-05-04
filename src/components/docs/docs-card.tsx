import Link from "next/link";

export function DocsCard({
  title,
  description,
  href,
  badge,
}: {
  title: string;
  description: string;
  href?: string;
  badge?: string;
}) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {badge && (
          <span className="shrink-0 rounded-full border border-border bg-secondary px-2 py-0.5 text-[0.6rem] font-medium text-muted">
            {badge}
          </span>
        )}
      </div>
      <p className="mt-1.5 text-sm leading-6 text-muted">{description}</p>
    </>
  );

  const classes =
    "block rounded-[1.5rem] border border-border bg-background/75 p-5 transition hover:border-accent/40";

  if (href) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return <div className={classes}>{content}</div>;
}
