import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AUTH_COOKIE_NAME } from "./constants";
import { getCurrentUserByToken } from "./service";
import type { AuthUser } from "./types";

export async function getServerCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value ?? null;

  return getCurrentUserByToken(token);
}

export async function requireServerUser(redirectTo?: string): Promise<AuthUser> {
  const user = await getServerCurrentUser();

  if (!user) {
    const nextPath = redirectTo ? `?redirect=${encodeURIComponent(redirectTo)}` : "";

    redirect(`/login${nextPath}`);
  }

  return user;
}

export async function requireServerAdminUser(redirectTo: string = "/admin"): Promise<AuthUser> {
  const user = await getServerCurrentUser();

  if (!user) {
    redirect(`/login?redirect=${encodeURIComponent(redirectTo)}`);
  }

  if (user.role !== "ADMIN") {
    redirect("/");
  }

  return user;
}
