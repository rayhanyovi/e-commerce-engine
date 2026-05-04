type Status = "stable" | "experimental" | "coming-soon";

const statusConfig: Record<Status, { label: string; dot: string; text: string }> = {
  stable: {
    label: "Stable",
    dot: "bg-status-success",
    text: "text-status-success-foreground dark:text-status-success",
  },
  experimental: {
    label: "Experimental",
    dot: "bg-status-warning",
    text: "text-status-warning-foreground dark:text-status-warning",
  },
  "coming-soon": {
    label: "Coming Soon",
    dot: "bg-muted",
    text: "text-muted",
  },
};

export function DocsStatusPill({ status }: { status: Status }) {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border border-border bg-background/75 px-3 py-1 text-xs font-medium ${config.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}
