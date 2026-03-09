import Link from "next/link";

import { DataState } from "@/components/ui/data-state";
import { toUserFacingErrorMessage } from "@/lib/user-facing-error";
import { listPublicCategories } from "@/server/catalog";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  let categories: Awaited<ReturnType<typeof listPublicCategories>> | null = null;
  let errorMessage: string | null = null;

  try {
    categories = await listPublicCategories();
  } catch (error) {
    errorMessage = toUserFacingErrorMessage(
      error,
      "Category data could not be loaded right now. Try again after the database setup is ready.",
    );
  }

  if (!categories) {
    return (
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-10 lg:px-10">
        <DataState
          tone="error"
          eyebrow="Category Error"
          title="Categories are not available yet"
          description={
            errorMessage ??
            "Category data could not be loaded right now. Try again after the database setup is ready."
          }
          actions={[
            { href: "/categories", label: "Reload categories" },
            { href: "/", label: "Back to home", variant: "secondary" },
          ]}
        />
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10 lg:px-10">
      <section className="grid gap-5 rounded-[2rem] border border-border bg-surface p-6 lg:grid-cols-[1.1fr_0.9fr] lg:p-8">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-muted">Storefront Categories</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">Browse by category</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
            Route `/categories` sekarang hidup sebagai storefront directory ringan untuk masuk ke
            catalog yang sudah difilter per kategori.
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-border bg-background p-5">
          <p className="text-sm text-muted">Active Categories</p>
          <div className="mt-3 text-4xl font-semibold">{categories.length}</div>
          <p className="mt-2 text-sm text-muted">
            Kategori aktif ini ditarik dari public catalog module yang sama dengan product listing.
          </p>
        </div>
      </section>

      {!categories.length ? (
        <DataState
          eyebrow="Category Empty"
          title="No active categories yet"
          description="There are no active storefront categories yet. Add some categories from admin, then assign products to them."
          actions={[
            { href: "/products", label: "Open products" },
            { href: "/", label: "Back to home", variant: "secondary" },
          ]}
        />
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/products?category=${encodeURIComponent(category.slug)}`}
              className="rounded-[1.5rem] border border-border bg-surface p-5 transition hover:border-accent"
            >
              <div className="rounded-[1.25rem] border border-border bg-[linear-gradient(160deg,#f0ead6,#ddd0a8)] p-5">
                <div className="text-xs uppercase tracking-[0.18em] text-muted">Category</div>
                <div className="mt-8 text-3xl font-semibold tracking-tight">
                  {category.name.slice(0, 2).toUpperCase()}
                </div>
              </div>
              <div className="mt-5">
                <h2 className="text-xl font-semibold">{category.name}</h2>
                <p className="mt-2 text-sm text-muted">{category.slug}</p>
              </div>
              <div className="mt-6 text-sm font-medium text-accent">Open filtered products</div>
            </Link>
          ))}
        </section>
      )}
    </main>
  );
}
