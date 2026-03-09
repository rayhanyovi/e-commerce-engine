"use client";

export function LoadingState({
  eyebrow,
  title,
  description,
  cardCount = 3,
  showSidebar = false,
}: {
  eyebrow: string;
  title: string;
  description: string;
  cardCount?: number;
  showSidebar?: boolean;
}) {
  return (
    <section className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <div className="rounded-[1.75rem] border border-border bg-surface p-8">
          <p className="text-sm uppercase tracking-[0.18em] text-muted">{eyebrow}</p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">{description}</p>
        </div>

        <div className={`grid gap-4 ${cardCount > 1 ? "md:grid-cols-2" : ""}`}>
          {Array.from({ length: cardCount }).map((_, index) => (
            <div
              key={index}
              className="h-36 animate-pulse rounded-[1.5rem] border border-border bg-surface"
            />
          ))}
        </div>
      </div>

      {showSidebar ? (
        <div className="h-[420px] animate-pulse rounded-[1.5rem] border border-border bg-surface" />
      ) : null}
    </section>
  );
}
