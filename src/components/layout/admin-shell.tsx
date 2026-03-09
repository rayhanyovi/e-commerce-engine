"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { LogoutButton } from "@/components/auth/logout-button";
import { adminNav, isNavigationItemActive } from "@/config/navigation";

export function AdminShell({
  children,
  storeName,
  currentUser,
}: {
  children: React.ReactNode;
  storeName: string;
  currentUser: {
    name: string;
    email: string;
    role: "ADMIN";
  };
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-4 lg:min-h-[calc(100vh-2rem)] lg:grid-cols-[300px_1fr]">
        <aside className="rounded-[2rem] border border-border bg-surface/95 px-5 py-6 shadow-[0_24px_80px_rgb(28_25_23_/_0.06)] lg:px-6">
          <div className="mb-6">
            <p className="text-[0.7rem] uppercase tracking-[0.28em] text-muted">
              Admin Control Layer
            </p>
            <Link href="/admin" className="mt-2 inline-block text-lg font-semibold tracking-[0.12em] uppercase">
              {storeName} Admin
            </Link>
            <p className="mt-2 text-sm leading-7 text-muted">
              Session admin di-resolve dari server helper dan dipakai langsung untuk guard,
              dashboard, dan operational modules.
            </p>
          </div>

          <nav className="flex gap-2 overflow-x-auto pb-1 lg:flex-col">
            {adminNav.map((item) => {
              const active = isNavigationItemActive(pathname, item);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`shrink-0 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                    active
                      ? "bg-accent text-white shadow-[0_10px_24px_rgb(154_52_18_/_0.22)]"
                      : "border border-border bg-background/80 text-muted hover:text-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-6 rounded-[1.5rem] border border-border/80 bg-background/75 p-4 text-sm text-muted">
            Scope order aktif: Storefront, Admin, Auth, Inventory, Catalog, Cart, Checkout,
            Payments, Orders, Promotions, Settings, Audit.
          </div>
        </aside>

        <div className="flex min-h-full flex-col gap-4">
          <header className="rounded-[2rem] border border-border bg-surface/95 px-5 py-5 shadow-[0_24px_80px_rgb(28_25_23_/_0.06)] lg:px-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-[0.7rem] uppercase tracking-[0.28em] text-muted">
                  Operations Workspace
                </p>
                <h1 className="mt-2 text-xl font-semibold">Admin Workspace</h1>
                <p className="mt-2 text-sm leading-7 text-muted">
                  Workspace {storeName} sekarang membaca data langsung dari server modules di root
                  Next app.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="rounded-full border border-border bg-background/80 px-4 py-2 text-sm text-muted">
                  {currentUser.name} · {currentUser.email}
                </div>
                <Link
                  href="/"
                  className="rounded-full border border-border bg-background/80 px-4 py-2 text-sm text-muted transition hover:text-foreground"
                >
                  Back to Store
                </Link>
                <LogoutButton
                  redirectTo="/login"
                  className="rounded-full border border-border bg-background/80 px-4 py-2 text-sm text-muted transition hover:text-foreground disabled:cursor-not-allowed disabled:text-muted/60"
                />
              </div>
            </div>
          </header>

          <main className="flex-1 rounded-[2rem] border border-border bg-surface/90 px-5 py-6 shadow-[0_24px_80px_rgb(28_25_23_/_0.04)] lg:px-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
