import { LoadingState } from "@/components/ui/loading-state";

export default function StorefrontLoading() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10 lg:px-10">
      <LoadingState
        eyebrow="Storefront Loading"
        title="Loading storefront workspace"
        description="Catalog, cart, checkout, orders, and customer account data are being prepared."
        cardCount={4}
        showSidebar
      />
    </main>
  );
}
