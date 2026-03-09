import { AddressesPageClient } from "@/components/storefront/addresses-page-client";

export default function AddressesPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10 lg:px-10">
      <AddressesPageClient />
    </main>
  );
}
