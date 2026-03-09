"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useState } from "react";

import { loginRequest, type AuthSessionRecord } from "@/lib/auth/client";

function getSuccessRedirect(user: AuthSessionRecord, redirectParam: string | null): string {
  if (redirectParam?.startsWith("/")) {
    return redirectParam;
  }

  return user.role === "ADMIN" ? "/admin" : "/orders";
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const result = await loginRequest({ email, password });

      router.push(getSuccessRedirect(result.user, searchParams.get("redirect")));
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to sign in right now",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-[1.5rem] border border-border bg-background p-5"
    >
      <label className="block text-sm font-medium">
        Email
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mt-2 w-full rounded-2xl border border-border bg-surface px-4 py-3 outline-none transition focus:border-accent"
          placeholder="you@example.com"
        />
      </label>

      <label className="block text-sm font-medium">
        Password
        <input
          type="password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-2 w-full rounded-2xl border border-border bg-surface px-4 py-3 outline-none transition focus:border-accent"
          placeholder="********"
        />
      </label>

      {errorMessage ? (
        <p className="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-full bg-accent px-5 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Signing in..." : "Login"}
      </button>

      <p className="text-sm text-muted">
        Belum punya akun?{" "}
        <Link href="/register" className="font-medium text-foreground underline">
          Register
        </Link>
      </p>
    </form>
  );
}
