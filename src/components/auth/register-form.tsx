"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import type { ApiEnvelope } from "@/shared/contracts";
import type { AuthUser } from "@/server/auth";

interface AuthSuccessPayload {
  user: AuthUser;
}

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          phone: phone || undefined,
        }),
      });
      const payload = (await response.json()) as ApiEnvelope<AuthSuccessPayload>;

      if (!response.ok || !payload.success) {
        const message =
          payload.success === false ? payload.error.message : "Registration failed";
        throw new Error(message);
      }

      router.push(payload.data.user.role === "ADMIN" ? "/admin" : "/orders");
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to create account right now",
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
        Name
        <input
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="mt-2 w-full rounded-2xl border border-border bg-surface px-4 py-3 outline-none transition focus:border-accent"
          placeholder="Your name"
        />
      </label>

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
        Phone
        <input
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          className="mt-2 w-full rounded-2xl border border-border bg-surface px-4 py-3 outline-none transition focus:border-accent"
          placeholder="+62812xxxxxxx"
        />
      </label>

      <label className="block text-sm font-medium">
        Password
        <input
          type="password"
          minLength={8}
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-2 w-full rounded-2xl border border-border bg-surface px-4 py-3 outline-none transition focus:border-accent"
          placeholder="Minimum 8 characters"
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
        {isSubmitting ? "Creating account..." : "Register"}
      </button>

      <p className="text-sm text-muted">
        Sudah punya akun?{" "}
        <Link href="/login" className="font-medium text-foreground underline">
          Login
        </Link>
      </p>
    </form>
  );
}
