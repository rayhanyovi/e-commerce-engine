import Link from "next/link";
import { mockProducts } from "@/data/mock-store";
import { ModulePlaceholder } from "@/components/ui/module-placeholder";

const cartLines = mockProducts.slice(0, 2).map((product, index) => ({
  id: product.slug,
  name: product.name,
  qty: index + 1,
  total: product.price * (index + 1),
}));

export default function CartPage() {
  const grandTotal = cartLines.reduce((sum, line) => sum + line.total, 0);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10 lg:px-10">
      <ModulePlaceholder
        title="Cart Shell"
        description="Cart page sudah berada di App Router final. State masih mocked sambil menunggu port guest identity, active cart lookup, dan mutation layer."
        bullets={[
          "Guest cart strategy belum diputuskan final karena auth foundation belum masuk.",
          "Route /cart sudah siap untuk dihubungkan ke cart domain baru.",
          "Ringkasan di bawah ini hanya mock visual untuk mengunci layout dan state slots.",
          "Cart mutation akan dipindah setelah catalog dan auth foundation lebih stabil.",
        ]}
      />

      <section className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          {cartLines.map((line) => (
            <div key={line.id} className="rounded-[1.5rem] border border-border bg-surface p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">{line.name}</h2>
                  <p className="mt-1 text-sm text-muted">Quantity placeholder: {line.qty}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted">Line total</p>
                  <p className="text-lg font-semibold">
                    Rp {line.total.toLocaleString("id-ID")}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <aside className="rounded-[1.5rem] border border-border bg-surface p-5">
          <p className="text-sm uppercase tracking-[0.18em] text-muted">Summary</p>
          <div className="mt-5 space-y-3 text-sm text-muted">
            <div className="flex items-center justify-between">
              <span>Items</span>
              <span>{cartLines.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Shipping</span>
              <span>Calculated later</span>
            </div>
            <div className="flex items-center justify-between text-base font-semibold text-foreground">
              <span>Total</span>
              <span>Rp {grandTotal.toLocaleString("id-ID")}</span>
            </div>
          </div>
          <div className="mt-6 flex flex-col gap-3">
            <Link
              href="/checkout"
              className="rounded-full bg-accent px-5 py-3 text-center text-sm font-medium text-white"
            >
              Continue to Checkout
            </Link>
            <Link
              href="/products"
              className="rounded-full border border-border px-5 py-3 text-center text-sm font-medium text-muted transition hover:text-foreground"
            >
              Back to Products
            </Link>
          </div>
        </aside>
      </section>
    </main>
  );
}
