import { getServerCurrentUser } from "@/server/auth/server";

import { ProfilePageClient } from "@/components/storefront/profile-page-client";
import type { AuthSessionRecord } from "@/lib/auth/client";

export default async function ProfilePage() {
  let initialSession: AuthSessionRecord | null | undefined = undefined;

  try {
    const user = await getServerCurrentUser();

    initialSession = user
      ? {
          ...user,
          phone: user.phone ?? null,
        }
      : null;
  } catch {
    initialSession = undefined;
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10 lg:px-10">
      <ProfilePageClient initialSession={initialSession} />
    </main>
  );
}
