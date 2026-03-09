import Link from "next/link";
import { mockProducts } from "@/data/mock-store";
import { ModulePlaceholder } from "@/components/ui/module-placeholder";

export default function ProductsPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10 lg:px-10">
      <ModulePlaceholder
        title="Catalog Listing Shell"
        description="Products list sudah dipindahkan ke App Router. Data masih berasal dari mock layer sampai catalog domain dan query contract dipindahkan dari source lama."
        bullets={[
          "Public catalog page sudah punya route final: /products.",
          "Next batch untuk halaman ini adalah port query params, pagination, filter, dan search contract.",
          "Product cards di bawah ini sengaja mock supaya UI migration bisa jalan sebelum server data siap.",
          "Source referensi lama tetap dipakai hanya untuk parity checks sampai domain catalog selesai.",
        ]}
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {mockProducts.map((product) => (
          <Link
            key={product.slug}
            href={`/products/${product.slug}`}
            className="rounded-[1.5rem] border border-border bg-surface p-5 transition hover:border-accent"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-muted">{product.category}</span>
              <span className="rounded-full bg-background px-3 py-1 text-xs uppercase tracking-[0.18em] text-muted">
                {product.badge}
              </span>
            </div>
            <h2 className="mt-4 text-xl font-semibold">{product.name}</h2>
            <p className="mt-3 text-sm leading-6 text-muted">{product.description}</p>
            <div className="mt-6 flex items-center justify-between">
              <span className="text-lg font-semibold">
                Rp {product.price.toLocaleString("id-ID")}
              </span>
              <span className="text-xs text-muted">{product.stockLabel}</span>
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}
