"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { docsSidebar } from "@/content/docs/sidebar";

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className={`shrink-0 transition-transform ${open ? "rotate-90" : ""}`}
    >
      <path
        d="M6 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function DocsSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  function toggleSection(title: string) {
    setCollapsed((prev) => ({ ...prev, [title]: !prev[title] }));
  }

  function isActive(href: string) {
    return pathname === href;
  }

  return (
    <nav aria-label="Documentation navigation" className="space-y-1">
      <div className="mb-5">
        <Link
          href="/docs"
          className="text-lg font-semibold tracking-tight text-foreground"
          onClick={onNavigate}
        >
          Docs
        </Link>
        <p className="mt-1 text-xs leading-5 text-muted">
          E-Commerce Engine
        </p>
      </div>

      {docsSidebar.map((section) => {
        const isCollapsed = collapsed[section.title] ?? false;

        return (
          <div key={section.title} className="pb-2">
            <button
              onClick={() => toggleSection(section.title)}
              className="flex w-full items-center justify-between px-3 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-muted transition hover:text-foreground"
              aria-expanded={!isCollapsed}
            >
              {section.title}
              <ChevronIcon open={!isCollapsed} />
            </button>

            {!isCollapsed && (
              <div className="mt-0.5 space-y-0.5">
                {section.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition ${
                      isActive(item.href)
                        ? "bg-accent text-white shadow-[0_10px_24px_rgb(154_52_18_/_0.22)]"
                        : "text-muted hover:text-foreground"
                    }`}
                  >
                    <span className="truncate">{item.title}</span>
                    {item.status === "coming-soon" && (
                      <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-[0.6rem] font-medium text-muted">
                        Soon
                      </span>
                    )}
                    {item.status === "experimental" && (
                      <span className="shrink-0 rounded-full bg-status-warning/10 px-2 py-0.5 text-[0.6rem] font-medium text-status-warning-foreground dark:text-status-warning">
                        Beta
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
