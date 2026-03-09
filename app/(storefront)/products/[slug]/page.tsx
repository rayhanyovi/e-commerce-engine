import Link from "next/link";
import { notFound } from "next/navigation";
import { getMockProductBySlug } from "@/data/mock-store";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getMockProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-10 lg:px-10">
      <Link href="/products" className="text-sm text-muted transition hover:text-foreground">
        Back to Products
      </Link>

      <section className="grid gap-6 rounded-[2rem] border border-border bg-surface p-6 lg:grid-cols-[0.95fr_1.05fr] lg:p-8">
        <div className="flex min-h-[320px] items-end rounded-[1.5rem] border border-border bg-[linear-gradient(160deg,#f5ede0,#efe2c7)] p-6 dark:bg-[linear-gradient(160deg,#2b241d,#1f1a15)]">
          <div className="rounded-full bg-background px-3 py-1 text-xs uppercase tracking-[0.18em] text-muted">
            {product.badge}
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-muted">{product.category}</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight">{product.name}</h1>
          </div>
          <p className="text-base leading-7 text-muted">{product.description}</p>
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-2xl font-semibold">
              Rp {product.price.toLocaleString("id-ID")}
            </span>
            <span className="rounded-full border border-border px-3 py-1 text-sm text-muted">
              {product.stockLabel}
            </span>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-border bg-background px-4 py-4 text-sm text-muted">
              Variant selector, option definitions, dan stock-aware add-to-cart akan datang setelah catalog
              dan cart domain dipindahkan.
            </div>
            <div className="rounded-2xl border border-border bg-background px-4 py-4 text-sm text-muted">
              Halaman detail sudah berada di route final `/products/[slug]` sehingga wiring data bisa
              dilanjutkan tanpa mengubah URL lagi.
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="rounded-full bg-accent px-5 py-3 text-sm font-medium text-white">
              Mock Add to Cart
            </button>
            <Link
              href="/checkout"
              className="rounded-full border border-border px-5 py-3 text-sm font-medium text-muted transition hover:text-foreground"
            >
              Review Checkout
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
