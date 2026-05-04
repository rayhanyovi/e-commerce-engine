import { DocsCodeBlock } from "./docs-code-block";

export function DocsSteps({
  steps,
}: {
  steps: { title: string; description: string; code?: { code: string; language: string } }[];
}) {
  return (
    <div className="space-y-6">
      {steps.map((step, i) => (
        <div key={i} className="flex gap-4">
          <div className="flex shrink-0 flex-col items-center">
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-secondary text-sm font-semibold text-foreground">
              {i + 1}
            </span>
            {i < steps.length - 1 && (
              <div className="mt-2 flex-1 border-l border-border" />
            )}
          </div>
          <div className="flex-1 pb-6">
            <h4 className="text-sm font-semibold text-foreground">
              {step.title}
            </h4>
            <p className="mt-1 text-sm leading-7 text-muted">
              {step.description}
            </p>
            {step.code && (
              <div className="mt-3">
                <DocsCodeBlock
                  code={step.code.code}
                  language={step.code.language}
                />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
