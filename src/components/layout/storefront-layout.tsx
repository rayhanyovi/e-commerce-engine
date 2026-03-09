"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { LogoutButton } from "@/components/auth/logout-button";
import { isNavigationItemActive, storefrontNav } from "@/config/navigation";

export function StorefrontLayout({
  children,
  storeName,
  currentUser,
}: {
  children: React.ReactNode;
  storeName: string;
  currentUser: {
    name: string;
    role: "CUSTOMER" | "ADMIN";
  } | null;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 px-4 pt-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-[2rem] border border-border/80 bg-surface/95 shadow-[0_24px_80px_rgb(28_25_23_/_0.06)] backdrop-blur">
          <div className="flex flex-col gap-4 px-5 py-5 lg:px-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-[0.7rem] font-medium uppercase tracking-[0.28em] text-muted">
                  Reusable Commerce Engine
                </p>
                <Link
                  href="/"
                  className="mt-2 inline-block text-lg font-semibold tracking-[0.14em] uppercase"
                >
                  {storeName}
                </Link>
                <p className="mt-1 text-sm text-muted">
                  Storefront, cart, checkout, and order flows powered by one Next.js engine.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {currentUser ? (
                  <>
                    <Link
                      href="/profile"
                      className="rounded-full border border-border bg-background/80 px-4 py-2 text-sm font-medium text-muted transition hover:text-foreground"
                    >
                      {currentUser.name}
                    </Link>
                    <Link
                      href={currentUser.role === "ADMIN" ? "/admin" : "/orders"}
                      className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-strong"
                    >
                      {currentUser.role === "ADMIN" ? "Admin" : "Orders"}
                    </Link>
                    <LogoutButton
                      redirectTo="/"
                      className="rounded-full border border-border bg-background/80 px-4 py-2 text-sm font-medium text-muted transition hover:text-foreground disabled:cursor-not-allowed disabled:text-muted/60"
                    />
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="rounded-full border border-border bg-background/80 px-4 py-2 text-sm font-medium text-muted transition hover:text-foreground"
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-strong"
                    >
                      Register
                    </Link>
                  </>
                )}
              </div>
            </div>

            <nav className="flex gap-2 overflow-x-auto pb-1">
              {storefrontNav.map((item) => {
                const active = isNavigationItemActive(pathname, item);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
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
          </div>
        </div>
      </header>

      <div className="px-4 pb-8 pt-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">{children}</div>
      </div>

      <footer className="px-4 pb-6 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-4 rounded-[2rem] border border-border bg-surface/90 px-5 py-5 text-sm text-muted sm:grid-cols-2 lg:px-8">
          <div className="rounded-[1.5rem] border border-border/80 bg-background/75 px-4 py-4">
            <p className="text-[0.7rem] uppercase tracking-[0.24em] text-muted">
              Storefront Layer
            </p>
            <p className="mt-2 leading-7">
              {storeName} sekarang berjalan di atas engine storefront, auth, cart, checkout,
              orders, addresses, categories, dan profile di root Next app.
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-border/80 bg-background/75 px-4 py-4">
            <p className="text-[0.7rem] uppercase tracking-[0.24em] text-muted">
              Migration Status
            </p>
            <p className="mt-2 leading-7">
              Legacy reference tetap ada di <code>ecommercestarter/</code> sampai parity final
              selesai dan cutover terakhir ditutup.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
