"use client";

import { useCallback, useState } from "react";

import { DocsMobileNav } from "./docs-mobile-nav";
import { DocsSidebar } from "./docs-sidebar";
import { DocsTopbar } from "./docs-topbar";

export function DocsShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  return (
    <>
      <DocsMobileNav isOpen={mobileOpen} onClose={closeMobile} />

      <div className="mx-auto min-h-screen max-w-[1440px] px-4 py-4 sm:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
          <aside className="sticky top-4 hidden max-h-[calc(100vh-2rem)] overflow-y-auto rounded-[2rem] border border-border bg-sidebar-background/95 px-5 py-6 shadow-[0_24px_80px_rgb(28_25_23_/_0.06)] lg:block lg:px-6">
            <DocsSidebar />
          </aside>

          <div className="flex min-h-full flex-col gap-4">
            <DocsTopbar onMenuToggle={() => setMobileOpen(true)} />

            <main className="flex-1 rounded-[2rem] border border-border bg-surface/95 px-5 py-8 shadow-[0_24px_80px_rgb(28_25_23_/_0.06)] sm:px-8 lg:px-10">
              <div className="mx-auto max-w-3xl">
                {children}
              </div>
            </main>
          </div>
        </div>
      </div>
    </>
  );
}
