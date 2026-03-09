import Link from "next/link";
import { mockProducts } from "@/data/mock-store";

const scopeOrder = [
  "StoreFront",
  "Admin",
  "Auth",
  "Inventory",
  "Catalog",
  "Cart",
  "Checkout",
  "Payments",
  "Orders",
  "Promotions",
  "Settings",
  "Audit",
];

export default function StorefrontHomePage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10 lg:px-10">
      <section className="grid gap-6 rounded-[2rem] border border-border bg-surface px-6 py-8 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
        <div className="space-y-5">
          <div className="inline-flex rounded-full border border-border bg-background px-3 py-1 text-xs uppercase tracking-[0.24em] text-muted">
            Storefront First
          </div>
          <div className="space-y-3">
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
              Next storefront baru sedang dibangun langsung di root app, bukan di source legacy.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-muted sm:text-lg">
              Halaman ini sekarang jadi landing storefront awal. Visual shell sudah dipisah dari source lama
              supaya migrasi catalog, cart, checkout, dan orders bisa masuk ke struktur App Router final.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/products"
              className="rounded-full bg-accent px-5 py-3 text-sm font-medium text-white transition hover:bg-accent-strong"
            >
              Browse Products
            </Link>
            <Link
              href="/checkout"
              className="rounded-full border border-border px-5 py-3 text-sm font-medium text-muted transition hover:text-foreground"
            >
              Review Checkout Shell
            </Link>
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-border bg-background p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">Scope Order</p>
          <div className="mt-4 grid gap-2">
            {scopeOrder.map((item, index) => (
              <div key={item} className="flex items-center gap-3 rounded-2xl border border-border px-4 py-3">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-surface text-sm font-semibold">
                  {index + 1}
                </span>
                <span className="text-sm font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {mockProducts.map((product) => (
          <Link
            key={product.slug}
            href={`/products/${product.slug}`}
            className="rounded-[1.5rem] border border-border bg-surface p-5 transition hover:-translate-y-0.5 hover:border-accent"
          >
            <div className="inline-flex rounded-full bg-background px-3 py-1 text-xs uppercase tracking-[0.18em] text-muted">
              {product.badge}
            </div>
            <h2 className="mt-4 text-xl font-semibold">{product.name}</h2>
            <p className="mt-2 text-sm text-muted">{product.category}</p>
            <p className="mt-4 text-sm leading-6 text-muted">{product.description}</p>
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
