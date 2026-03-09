import Link from "next/link";

export default function RegisterPage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-5xl items-center px-6 py-10 lg:px-10">
      <section className="grid w-full gap-6 rounded-[2rem] border border-border bg-surface p-6 lg:grid-cols-[0.9fr_1.1fr] lg:p-8">
        <div className="rounded-[1.5rem] border border-border bg-background p-5">
          <p className="text-sm uppercase tracking-[0.18em] text-muted">Auth Shell</p>
          <h1 className="mt-4 text-3xl font-semibold">Register</h1>
          <p className="mt-3 text-sm leading-7 text-muted">
            Route final untuk onboarding customer sudah ada. Validasi schema dan session issuance akan
            dipasang di batch auth berikutnya.
          </p>
        </div>

        <form className="space-y-4 rounded-[1.5rem] border border-border bg-background p-5">
          <label className="block text-sm font-medium">
            Name
            <input className="mt-2 w-full rounded-2xl border border-border bg-surface px-4 py-3 outline-none" placeholder="Your name" />
          </label>
          <label className="block text-sm font-medium">
            Email
            <input className="mt-2 w-full rounded-2xl border border-border bg-surface px-4 py-3 outline-none" placeholder="you@example.com" />
          </label>
          <label className="block text-sm font-medium">
            Password
            <input type="password" className="mt-2 w-full rounded-2xl border border-border bg-surface px-4 py-3 outline-none" placeholder="Minimum 8 characters" />
          </label>
          <button type="button" className="w-full rounded-full bg-accent px-5 py-3 text-sm font-medium text-white">
            Register Soon
          </button>
          <p className="text-sm text-muted">
            Sudah punya akun?{" "}
            <Link href="/login" className="font-medium text-foreground underline">
              Login
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
}
