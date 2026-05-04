"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { getBreadcrumbs } from "@/content/docs/page-registry";

import { DocsSearchButton } from "./docs-search-button";

export function DocsTopbar({ onMenuToggle }: { onMenuToggle: () => void }) {
  const pathname = usePathname();
  const breadcrumbs = getBreadcrumbs(pathname);

  return (
    <header className="rounded-2xl border border-border bg-surface/95 px-4 py-3 shadow-[0_24px_80px_rgb(28_25_23_/_0.06)] backdrop-blur sm:px-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuToggle}
            className="rounded-lg p-1.5 text-muted transition hover:text-foreground lg:hidden"
            aria-label="Open navigation"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M3 5h14M3 10h14M3 15h14"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>

          <nav aria-label="Breadcrumb" className="hidden sm:block">
            <ol className="flex items-center gap-1.5 text-sm text-muted">
              {breadcrumbs.map((crumb, i) => (
                <li key={i} className="flex items-center gap-1.5">
                  {i > 0 && <span className="text-border">/</span>}
                  {crumb.href ? (
                    <Link
                      href={crumb.href}
                      className="transition hover:text-foreground"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-foreground">{crumb.label}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <DocsSearchButton />
          <Link
            href="/"
            className="hidden rounded-full border border-border bg-background/75 px-3 py-1.5 text-sm text-muted transition hover:text-foreground md:inline-flex"
          >
            Storefront
          </Link>
          <Link
            href="/admin"
            className="hidden rounded-full border border-border bg-background/75 px-3 py-1.5 text-sm text-muted transition hover:text-foreground md:inline-flex"
          >
            Admin
          </Link>
        </div>
      </div>
    </header>
  );
}
