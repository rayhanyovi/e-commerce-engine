"use client";

export function DocsSearchButton() {
  return (
    <button
      onClick={() => {}}
      className="flex items-center gap-2 rounded-full border border-border bg-background/75 px-3 py-1.5 text-sm text-muted transition hover:text-foreground"
      aria-label="Search documentation"
    >
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0">
        <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M11 11l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <span className="hidden sm:inline">Search...</span>
      <kbd className="hidden rounded border border-border bg-secondary px-1.5 py-0.5 font-mono text-[0.6rem] text-muted sm:inline">
        Ctrl K
      </kbd>
    </button>
  );
}
