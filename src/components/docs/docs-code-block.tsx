"use client";

import { useState } from "react";

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <rect x="5" y="5" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M3 11V3a1 1 0 011-1h8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path
        d="M3 8.5l3.5 3.5L13 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function DocsCodeBlock({
  code,
  language,
  title,
}: {
  code: string;
  language: string;
  title?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-stone-800 bg-stone-950">
      <div className="flex items-center justify-between border-b border-stone-800 px-4 py-3">
        <span className="text-xs uppercase tracking-[0.24em] text-stone-400">
          {title ?? language}
        </span>
        <button
          onClick={handleCopy}
          className="text-stone-400 transition hover:text-stone-200"
          aria-label="Copy code"
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
        </button>
      </div>
      <pre className="overflow-x-auto px-4 py-4 text-sm leading-7 text-stone-100">
        <code>{code}</code>
      </pre>
    </div>
  );
}
