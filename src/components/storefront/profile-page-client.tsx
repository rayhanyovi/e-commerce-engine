"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { DataState } from "@/components/ui/data-state";
import { useSession } from "@/hooks";
import { updateMyProfileRequest, type ProfileRecord } from "@/lib/profile/client";
import type { AuthSessionRecord } from "@/lib/auth/client";

interface ProfileFormValue {
  name: string;
  phone: string;
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Profile request failed";
}

function createProfileFormValue(profile: ProfileRecord): ProfileFormValue {
  return {
    name: profile.name,
    phone: profile.phone ?? "",
  };
}

export function ProfilePageClient({
  initialSession,
}: {
  initialSession?: AuthSessionRecord | null;
}) {
  const { session, isLoading, error, refreshSession, setSession } = useSession(initialSession);
  const [formValue, setFormValue] = useState<ProfileFormValue>({
    name: "",
    phone: "",
  });
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!session) {
      return;
    }

    setFormValue(createProfileFormValue(session));
  }, [session]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    setSuccess(null);

    try {
      const nextProfile = await updateMyProfileRequest({
        name: formValue.name.trim(),
        phone: formValue.phone.trim() || undefined,
      });

      setSession(nextProfile);
      setFormValue(createProfileFormValue(nextProfile));
      setSuccess("Profile updated");
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="h-[320px] animate-pulse rounded-[1.5rem] border border-border bg-surface" />
        <div className="h-[420px] animate-pulse rounded-[1.5rem] border border-border bg-surface" />
      </section>
    );
  }

  if (!isLoading && !session) {
    return (
      <DataState
        tone="error"
        eyebrow="Login Required"
        title="Profile page needs an authenticated customer"
        description="Profile data is private account data. Sign in first, then you can update your display name and phone number."
        actions={[
          { href: "/login", label: "Login" },
          { href: "/", label: "Back to home", variant: "secondary" },
        ]}
      />
    );
  }

  if (error || !session) {
    return (
      <DataState
        tone="error"
        eyebrow="Profile Error"
        title="Profile could not be loaded"
        description={
          error ??
          "Profile data could not be loaded right now. Try again after the database setup is ready."
        }
        actions={[
          { href: "/profile", label: "Retry" },
          { href: "/", label: "Back to home", variant: "secondary" },
        ]}
      />
    );
  }

  const profile: ProfileRecord = session;

  return (
    <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
      <div className="space-y-4">
        <section className="rounded-[1.5rem] border border-border bg-surface p-5">
          <p className="text-sm uppercase tracking-[0.18em] text-muted">Account Profile</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">Manage account identity</h1>
          <p className="mt-3 text-sm leading-7 text-muted">
            Profile page sekarang hidup di root Next app. Customer bisa update name dan phone
            tanpa keluar dari storefront workspace.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[1.5rem] border border-border bg-surface p-5">
            <p className="text-sm text-muted">Role</p>
            <div className="mt-3 text-xl font-semibold">{profile.role}</div>
            <p className="mt-2 text-sm text-muted">Auth role dari current session owner.</p>
          </div>
          <div className="rounded-[1.5rem] border border-border bg-surface p-5">
            <p className="text-sm text-muted">Email</p>
            <div className="mt-3 text-lg font-semibold break-all">{profile.email}</div>
            <p className="mt-2 text-sm text-muted">Email login saat ini.</p>
          </div>
          <div className="rounded-[1.5rem] border border-border bg-surface p-5">
            <p className="text-sm text-muted">Checkout Ready</p>
            <div className="mt-3 text-3xl font-semibold">
              {profile.name.trim() ? "Yes" : "No"}
            </div>
            <p className="mt-2 text-sm text-muted">Customer snapshot akan memakai data account ini.</p>
          </div>
        </section>
      </div>

      <form onSubmit={handleSubmit} className="rounded-[1.5rem] border border-border bg-surface p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Edit Profile</h2>
            <p className="mt-2 text-sm leading-7 text-muted">
              Update field yang dipakai account snapshot dan admin user registry.
            </p>
          </div>
          <Link
            href="/orders"
            className="rounded-full border border-border px-4 py-2 text-sm font-medium text-muted transition hover:text-foreground"
          >
            Open Orders
          </Link>
        </div>

        {submitError ? (
          <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {submitError}
          </p>
        ) : null}

        {success ? (
          <p className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {success}
          </p>
        ) : null}

        <div className="mt-5 grid gap-4">
          <label className="text-sm font-medium">
            Name
            <input
              value={formValue.name}
              onChange={(event) =>
                setFormValue((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
              className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 outline-none transition focus:border-accent"
            />
          </label>

          <label className="text-sm font-medium">
            Email
            <input
              value={profile.email}
              disabled
              className="mt-2 w-full rounded-2xl border border-border bg-slate-100 px-4 py-3 text-muted outline-none"
            />
          </label>

          <label className="text-sm font-medium">
            Phone
            <input
              value={formValue.phone}
              onChange={(event) =>
                setFormValue((current) => ({
                  ...current,
                  phone: event.target.value,
                }))
              }
              className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 outline-none transition focus:border-accent"
            />
          </label>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-full bg-accent px-5 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-accent/60"
          >
            {isSubmitting ? "Saving..." : "Save Profile"}
          </button>
          <button
            type="button"
            onClick={() => {
              setSuccess(null);
              setSubmitError(null);
              void refreshSession();
            }}
            className="rounded-full border border-border px-5 py-3 text-sm font-medium text-muted transition hover:text-foreground"
          >
            Reset
          </button>
        </div>
      </form>
    </section>
  );
}
