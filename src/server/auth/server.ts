import { cookies } from "next/headers";

import { AUTH_COOKIE_NAME } from "./constants";
import { getCurrentUserByToken } from "./service";

export async function getServerCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value ?? null;

  return getCurrentUserByToken(token);
}
