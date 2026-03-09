export function ModulePlaceholder({
  title,
  description,
  bullets,
}: {
  title: string;
  description: string;
  bullets: string[];
}) {
  return (
    <section className="rounded-[1.75rem] border border-border bg-surface p-6">
      <div className="max-w-3xl">
        <h2 className="text-2xl font-semibold">{title}</h2>
        <p className="mt-3 text-sm leading-7 text-muted">{description}</p>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {bullets.map((bullet) => (
          <div key={bullet} className="rounded-2xl border border-border bg-background px-4 py-4 text-sm leading-6">
            {bullet}
          </div>
        ))}
      </div>
    </section>
  );
}
