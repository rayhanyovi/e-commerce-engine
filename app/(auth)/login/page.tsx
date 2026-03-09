import { Suspense } from "react";

import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-5xl items-center px-6 py-10 lg:px-10">
      <section className="grid w-full gap-6 rounded-[2rem] border border-border bg-surface p-6 lg:grid-cols-[0.9fr_1.1fr] lg:p-8">
        <div className="rounded-[1.5rem] border border-border bg-background p-5">
          <p className="text-sm uppercase tracking-[0.18em] text-muted">Customer Or Admin</p>
          <h1 className="mt-4 text-3xl font-semibold">Login</h1>
          <p className="mt-3 text-sm leading-7 text-muted">
            Session sekarang disimpan di cookie `httpOnly`, jadi login ini langsung cocok untuk SSR,
            admin guard, dan route handler Next yang baru.
          </p>

          <dl className="mt-6 space-y-4 text-sm text-muted">
            <div className="rounded-2xl border border-border bg-surface px-4 py-4">
              <dt className="font-medium text-foreground">Admin seed</dt>
              <dd className="mt-2 leading-6">
                Pakai `SEED_ADMIN_EMAIL` dan `SEED_ADMIN_PASSWORD` dari `.env` lalu jalankan seed.
              </dd>
            </div>
            <div className="rounded-2xl border border-border bg-surface px-4 py-4">
              <dt className="font-medium text-foreground">Redirect behavior</dt>
              <dd className="mt-2 leading-6">
                Admin masuk ke `/admin`, customer ke `/orders`, dan redirect param tetap dihormati.
              </dd>
            </div>
          </dl>
        </div>

        <Suspense
          fallback={
            <div className="rounded-[1.5rem] border border-border bg-background p-5">
              <p className="text-sm text-muted">Loading login form...</p>
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </section>
    </main>
  );
}
