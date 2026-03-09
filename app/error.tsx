"use client";

import Link from "next/link";
import { useEffect } from "react";

import { DataState } from "@/components/ui/data-state";
import { toUserFacingErrorMessage } from "@/lib/user-facing-error";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-4xl items-center px-6 py-10 lg:px-10">
      <DataState
        tone="error"
        eyebrow="Application Error"
        title="This page could not be loaded"
        description={toUserFacingErrorMessage(
          error,
          "Something went wrong while rendering this page. Try again after the current operation finishes.",
        )}
        extra={
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => reset()}
              className="rounded-full bg-accent px-5 py-3 text-sm font-medium text-white transition hover:bg-accent-strong"
            >
              Try again
            </button>
            <Link
              href="/"
              className="rounded-full border border-border px-5 py-3 text-sm font-medium text-muted transition hover:text-foreground"
            >
              Back to storefront
            </Link>
          </div>
        }
      />
    </main>
  );
}
