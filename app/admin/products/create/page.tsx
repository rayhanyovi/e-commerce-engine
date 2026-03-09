import { ProductForm } from "@/components/admin/product-form";
import { DataState } from "@/components/ui/data-state";
import { toUserFacingErrorMessage } from "@/lib/user-facing-error";
import { listAdminCategories } from "@/server/catalog";

export const dynamic = "force-dynamic";

export default async function AdminProductCreatePage() {
  let categories: Awaited<ReturnType<typeof listAdminCategories>> | null = null;
  let errorMessage: string | null = null;

  try {
    categories = await listAdminCategories();
  } catch (error) {
    errorMessage = toUserFacingErrorMessage(
      error,
      "Product editor could not load categories right now. Try again after the database setup is ready.",
    );
  }

  if (!categories) {
    return (
      <DataState
        tone="error"
        eyebrow="Product Error"
        title="Product create page is not available"
        description={
          errorMessage ??
          "Product editor could not load categories right now. Try again after the database setup is ready."
        }
        actions={[
          { href: "/admin/products/create", label: "Reload editor" },
          { href: "/admin/catalog", label: "Back to catalog", variant: "secondary" },
        ]}
      />
    );
  }

  if (!categories.length) {
    return (
      <DataState
        eyebrow="Category Required"
        title="Create a category before creating products"
        description="Products need a category assignment. Add at least one admin category first, then return to the product editor."
        actions={[
          { href: "/admin/categories", label: "Open categories" },
          { href: "/admin/catalog", label: "Back to catalog", variant: "secondary" },
        ]}
      />
    );
  }

  return <ProductForm mode="create" categories={categories} />;
}
