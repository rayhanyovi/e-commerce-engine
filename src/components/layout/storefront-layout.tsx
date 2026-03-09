"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { storefrontNav } from "@/config/navigation";

export function StorefrontLayout({
  children,
  storeName,
}: {
  children: React.ReactNode;
  storeName: string;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4 lg:px-10">
          <div>
            <Link href="/" className="text-lg font-semibold tracking-[0.12em] uppercase">
              {storeName}
            </Link>
            <p className="text-xs text-muted">Commerce engine live on Next.js</p>
          </div>

          <nav className="hidden items-center gap-2 md:flex">
            {storefrontNav.map((item) => {
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-full px-4 py-2 text-sm transition ${
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

          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-full border border-border px-4 py-2 text-sm font-medium text-muted transition hover:text-foreground"
            >
              Login
            </Link>
            <Link
              href="/admin"
              className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-strong"
            >
              Admin
            </Link>
          </div>
        </div>
      </header>

      {children}

      <footer className="border-t border-border bg-surface">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-6 text-sm text-muted lg:flex-row lg:items-center lg:justify-between lg:px-10">
          <p>{storeName} sekarang berjalan di atas engine storefront, auth, cart, checkout, orders, addresses, categories, dan profile di root Next app.</p>
          <p>Legacy reference tetap ada di `ecommercestarter/` sampai parity final selesai.</p>
        </div>
      </footer>
    </div>
  );
}
