"use client";

import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";

export function LogoutButton({
  className,
  redirectTo = "/",
}: {
  className?: string;
  redirectTo?: string;
}) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function handleLogout() {
    setIsPending(true);

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      startTransition(() => {
        router.push(redirectTo);
        router.refresh();
      });
    } catch (error) {
      console.error(error);
      setIsPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isPending}
      className={className}
    >
      {isPending ? "Logging out..." : "Logout"}
    </button>
  );
}
