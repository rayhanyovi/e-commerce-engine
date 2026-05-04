type CalloutVariant = "info" | "warning" | "tip";

const variantConfig: Record<
  CalloutVariant,
  { label: string; border: string; bg: string; icon: React.ReactNode }
> = {
  info: {
    label: "Info",
    border: "border-status-info/30",
    bg: "bg-status-info/5",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 7v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="8" cy="5" r="0.75" fill="currentColor" />
      </svg>
    ),
  },
  warning: {
    label: "Warning",
    border: "border-status-warning/30",
    bg: "bg-status-warning/5",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path
          d="M8 1.5l6.5 12H1.5L8 1.5z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path d="M8 6.5v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="8" cy="11.5" r="0.75" fill="currentColor" />
      </svg>
    ),
  },
  tip: {
    label: "Tip",
    border: "border-status-success/30",
    bg: "bg-status-success/5",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path
          d="M8 1.5a4 4 0 014 4c0 1.5-.8 2.5-1.5 3.2-.4.4-.5.8-.5 1.3v.5H6v-.5c0-.5-.1-.9-.5-1.3C4.8 8 4 7 4 5.5a4 4 0 014-4z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path d="M6 13h4M6.5 14.5h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
};

export function DocsCallout({
  variant,
  title,
  children,
}: {
  variant: CalloutVariant;
  title?: string;
  children: React.ReactNode;
}) {
  const config = variantConfig[variant];

  return (
    <div className={`rounded-[1.5rem] border ${config.border} ${config.bg} p-5`}>
      <div className="flex items-center gap-2 text-foreground">
        {config.icon}
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.24em]">
          {title ?? config.label}
        </p>
      </div>
      <div className="mt-2 text-sm leading-7 text-muted">{children}</div>
    </div>
  );
}
