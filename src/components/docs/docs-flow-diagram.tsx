export function DocsFlowDiagram({
  title,
  diagram,
}: {
  title: string;
  diagram: string;
}) {
  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-stone-800 bg-stone-950">
      <div className="border-b border-stone-800 px-4 py-3">
        <span className="text-xs uppercase tracking-[0.24em] text-stone-400">
          {title}
        </span>
      </div>
      <pre className="overflow-x-auto px-4 py-4 font-mono text-sm leading-7 text-stone-100">
        {diagram}
      </pre>
    </div>
  );
}
