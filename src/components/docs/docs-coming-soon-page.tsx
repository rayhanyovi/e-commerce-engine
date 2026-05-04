import { DocsPageHeader } from "./docs-page-header";

export function DocsComingSoonPage({
  title,
  description,
  proposedArchitecture,
}: {
  title: string;
  description: string;
  proposedArchitecture?: string;
}) {
  return (
    <div>
      <DocsPageHeader
        eyebrow="Roadmap"
        title={title}
        description={description}
        status="coming-soon"
      />

      <div className="mt-8 rounded-[1.5rem] border border-border bg-secondary/30 p-6">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-muted">
          Planned Feature
        </p>
        <p className="mt-3 text-sm leading-7 text-muted">
          This feature is not yet implemented. It is included in the engine
          roadmap to signal the intended direction.
        </p>
      </div>

      {proposedArchitecture && (
        <div className="mt-6 space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            Proposed Architecture
          </h2>
          <p className="text-sm leading-7 text-muted">
            {proposedArchitecture}
          </p>
        </div>
      )}
    </div>
  );
}
