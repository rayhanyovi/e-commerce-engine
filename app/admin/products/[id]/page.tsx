import { ProductForm } from "@/components/admin/product-form";
import { DataState } from "@/components/ui/data-state";
import { formatCurrency } from "@/lib/formatters";
import { toUserFacingErrorMessage } from "@/lib/user-facing-error";
import { getAdminProductById, listAdminCategories } from "@/server/catalog";

export const dynamic = "force-dynamic";

export default async function AdminProductEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let categories: Awaited<ReturnType<typeof listAdminCategories>> | null = null;
  let product: Awaited<ReturnType<typeof getAdminProductById>> | null = null;
  let errorMessage: string | null = null;

  try {
    [categories, product] = await Promise.all([
      listAdminCategories(),
      getAdminProductById(id),
    ]);
  } catch (error) {
    errorMessage = toUserFacingErrorMessage(
      error,
      "Product detail could not be loaded right now. Try again after the database setup is ready.",
    );
  }

  if (!categories || !product) {
    return (
      <DataState
        tone="error"
        eyebrow="Product Error"
        title="Product edit page is not available"
        description={
          errorMessage ??
          "Product detail could not be loaded right now. Try again after the database setup is ready."
        }
        actions={[
          { href: `/admin/products/${id}`, label: "Reload product" },
          { href: "/admin/catalog", label: "Back to catalog", variant: "secondary" },
        ]}
      />
    );
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[1.5rem] border border-border bg-surface p-5">
          <p className="text-sm text-muted">Category</p>
          <div className="mt-3 text-2xl font-semibold">{product.category.name}</div>
          <p className="mt-2 text-sm text-muted">Current assignment for this product.</p>
        </div>
        <div className="rounded-[1.5rem] border border-border bg-surface p-5">
          <p className="text-sm text-muted">Base Price</p>
          <div className="mt-3 text-2xl font-semibold">{formatCurrency(product.basePrice)}</div>
          <p className="mt-2 text-sm text-muted">
            Effective variant pricing can override this baseline.
          </p>
        </div>
        <div className="rounded-[1.5rem] border border-border bg-surface p-5">
          <p className="text-sm text-muted">Variants</p>
          <div className="mt-3 text-2xl font-semibold">{product.variants.length}</div>
          <p className="mt-2 text-sm text-muted">
            Option combinations are rebuilt from the editor payload.
          </p>
        </div>
      </section>

      <ProductForm mode="edit" categories={categories} product={product} />
    </div>
  );
}
