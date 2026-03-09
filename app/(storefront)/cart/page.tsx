import { cookies } from "next/headers";

import { CartPageClient } from "@/components/storefront/cart-page-client";
import { GUEST_CART_COOKIE_NAME, getOrCreateActiveCart } from "@/server/cart";
import { getServerCurrentUser } from "@/server/auth/server";

export default async function CartPage() {
  let initialCart: Awaited<ReturnType<typeof getOrCreateActiveCart>> | null = null;

  try {
    const [cookieStore, user] = await Promise.all([cookies(), getServerCurrentUser()]);
    const guestToken = cookieStore.get(GUEST_CART_COOKIE_NAME)?.value ?? null;

    if (user) {
      initialCart = await getOrCreateActiveCart({ userId: user.id });
    } else if (guestToken) {
      initialCart = await getOrCreateActiveCart({ guestToken });
    }
  } catch {
    initialCart = null;
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10 lg:px-10">
      <CartPageClient initialCart={initialCart} />
    </main>
  );
}
