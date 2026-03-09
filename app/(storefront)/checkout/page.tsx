import { CheckoutPageClient } from "@/components/storefront/checkout-page-client";

export default function CheckoutPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10 lg:px-10">
      <CheckoutPageClient />
    </main>
  );
}
