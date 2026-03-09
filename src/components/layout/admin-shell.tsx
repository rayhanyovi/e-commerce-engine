"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminNav } from "@/config/navigation";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto grid min-h-screen max-w-7xl lg:grid-cols-[280px_1fr]">
        <aside className="border-r border-border bg-surface px-6 py-8">
          <div className="mb-8">
            <Link href="/admin" className="text-lg font-semibold tracking-[0.12em] uppercase">
              Admin Core
            </Link>
            <p className="mt-2 text-sm text-muted">
              Guard auth, catalog, dan inventory sudah terhubung. Domain lain menyusul batch berikutnya.
            </p>
          </div>

          <nav className="space-y-2">
            {adminNav.map((item) => {
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-2xl px-4 py-3 text-sm transition ${
                    active
                      ? "bg-accent text-white"
                      : "border border-transparent text-muted hover:border-border hover:text-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 rounded-3xl border border-border bg-background p-4 text-sm text-muted">
            Scope order aktif: Storefront, Admin, Auth, Inventory, Catalog, Cart, Checkout, Payments,
            Orders, Promotions, Settings, Audit.
          </div>
        </aside>

        <div className="flex min-h-screen flex-col">
          <header className="border-b border-border bg-background/90 px-6 py-4 backdrop-blur lg:px-10">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="text-lg font-semibold">Admin Workspace</h1>
                <p className="text-sm text-muted">
                  Workspace ini sekarang membaca data langsung dari server modules di root Next app.
                </p>
              </div>
              <Link
                href="/"
                className="rounded-full border border-border px-4 py-2 text-sm text-muted transition hover:text-foreground"
              >
                Back to Store
              </Link>
            </div>
          </header>

          <main className="flex-1 px-6 py-8 lg:px-10">{children}</main>
        </div>
      </div>
    </div>
  );
}
