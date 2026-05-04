"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { DocsSidebar } from "./docs-sidebar";

export function DocsMobileNav({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="fixed inset-y-0 left-0 w-[300px] overflow-y-auto border-r border-border bg-sidebar-background p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm font-semibold text-foreground">Navigation</span>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted transition hover:text-foreground"
            aria-label="Close navigation"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M4.5 4.5l9 9m0-9l-9 9"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
        <DocsSidebar onNavigate={onClose} />
      </div>
    </div>
  );
}
