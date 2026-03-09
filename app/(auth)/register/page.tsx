import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-5xl items-center px-6 py-10 lg:px-10">
      <section className="grid w-full gap-6 rounded-[2rem] border border-border bg-surface p-6 lg:grid-cols-[0.9fr_1.1fr] lg:p-8">
        <div className="rounded-[1.5rem] border border-border bg-background p-5">
          <p className="text-sm uppercase tracking-[0.18em] text-muted">Customer Onboarding</p>
          <h1 className="mt-4 text-3xl font-semibold">Register</h1>
          <p className="mt-3 text-sm leading-7 text-muted">
            Registrasi customer sekarang langsung membuat account, issue session cookie, lalu bawa
            user ke flow storefront tanpa ngelewatin localStorage lagi.
          </p>

          <div className="mt-6 grid gap-3 text-sm text-muted">
            <div className="rounded-2xl border border-border bg-surface px-4 py-4 leading-6">
              Register flow memakai schema `RegisterSchema`, hash password di server, lalu issue
              session cookie saat request sukses.
            </div>
            <div className="rounded-2xl border border-border bg-surface px-4 py-4 leading-6">
              Phone bersifat opsional sekarang supaya customer onboarding tidak terlalu berat di
              awal.
            </div>
          </div>
        </div>

        <RegisterForm />
      </section>
    </main>
  );
}
