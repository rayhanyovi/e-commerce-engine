import Link from "next/link";

import { CategoryForm } from "@/components/admin/category-form";
import { DataState } from "@/components/ui/data-state";
import { formatDateTime } from "@/lib/formatters";
import { toUserFacingErrorMessage } from "@/lib/user-facing-error";
import { listAdminCategories } from "@/server/catalog";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  let categories: Awaited<ReturnType<typeof listAdminCategories>> | null = null;
  let errorMessage: string | null = null;

  try {
    categories = await listAdminCategories();
  } catch (error) {
    errorMessage = toUserFacingErrorMessage(
      error,
      "Category registry could not be loaded right now. Try again after the database setup is ready.",
    );
  }

  if (!categories) {
    return (
      <DataState
        tone="error"
        eyebrow="Category Error"
        title="Admin categories are not available"
        description={
          errorMessage ??
          "Category registry could not be loaded right now. Try again after the database setup is ready."
        }
        actions={[
          { href: "/admin/categories", label: "Reload categories" },
          { href: "/admin", label: "Back to admin", variant: "secondary" },
        ]}
      />
    );
  }

  const activeCategories = categories.filter((category) => category.isActive).length;
  const inactiveCategories = categories.length - activeCategories;

  return (
    <div className="space-y-8">
      <section className="grid gap-4 xl:grid-cols-3">
        <div className="rounded-[1.5rem] border border-border bg-surface p-5">
          <p className="text-sm text-muted">Total Categories</p>
          <div className="mt-3 text-3xl font-semibold">{categories.length}</div>
          <p className="mt-2 text-sm text-muted">
            Registry category sekarang punya workspace admin sendiri.
          </p>
        </div>
        <div className="rounded-[1.5rem] border border-border bg-surface p-5">
          <p className="text-sm text-muted">Active Categories</p>
          <div className="mt-3 text-3xl font-semibold">{activeCategories}</div>
          <p className="mt-2 text-sm text-muted">
            Category aktif tersedia untuk storefront filtering dan product assignment.
          </p>
        </div>
        <div className="rounded-[1.5rem] border border-border bg-surface p-5">
          <p className="text-sm text-muted">Inactive Categories</p>
          <div className="mt-3 text-3xl font-semibold">{inactiveCategories}</div>
          <p className="mt-2 text-sm text-muted">
            Toggle active status bisa dipakai tanpa menghapus category record.
          </p>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <CategoryForm mode="create" />

        <div className="space-y-5">
          <section className="rounded-[1.5rem] border border-border bg-surface p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Category Registry</h2>
                <p className="mt-2 text-sm text-muted">
                  Create, edit, delete, dan activate category sekarang langsung hidup di root
                  Next app.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/admin/catalog"
                  className="rounded-full border border-border px-4 py-2 text-sm text-muted transition hover:text-foreground"
                >
                  Open Catalog
                </Link>
                <Link
                  href="/api/admin/categories"
                  className="rounded-full border border-border px-4 py-2 text-sm text-muted transition hover:text-foreground"
                >
                  Inspect API
                </Link>
              </div>
            </div>
          </section>

          {!categories.length ? (
            <DataState
              eyebrow="Category Empty"
              title="No categories yet"
              description="Create the first category here, then products can be assigned to it from the catalog workspace."
              size="compact"
            />
          ) : (
            <section className="space-y-4">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="rounded-[1.5rem] border border-border bg-surface p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-xl font-semibold">{category.name}</h2>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            category.isActive
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {category.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <p className="mt-3 text-sm text-muted">Slug: {category.slug}</p>
                    </div>

                    <div className="rounded-2xl border border-border bg-background px-4 py-4 text-sm text-muted">
                      <p>Created {formatDateTime(category.createdAt)}</p>
                      <p className="mt-2">Updated {formatDateTime(category.updatedAt)}</p>
                    </div>
                  </div>

                  <div className="mt-5">
                    <CategoryForm
                      mode="edit"
                      category={{
                        id: category.id,
                        name: category.name,
                        slug: category.slug,
                        isActive: category.isActive,
                      }}
                    />
                  </div>
                </div>
              ))}
            </section>
          )}
        </div>
      </section>
    </div>
  );
}
