"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  createProductRequest,
  deleteProductRequest,
  updateProductRequest,
} from "@/lib/products/client";
import type { CreateProductDto, UpdateProductDto } from "@/shared/contracts";

type ProductFormMode = "create" | "edit";

interface ProductCategoryOption {
  id: string;
  name: string;
  isActive?: boolean;
}

interface ProductOptionDefinitionDraft {
  name: string;
  values: string[];
}

interface ProductVariantDraft {
  sku: string;
  priceOverride: string;
  stockOnHand: string;
  isActive: boolean;
  optionValues: string[];
}

interface ProductFormValue {
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  basePrice: string;
  promoPrice: string;
  isActive: boolean;
  mediaUrls: string[];
  optionDefinitions: ProductOptionDefinitionDraft[];
  variants: ProductVariantDraft[];
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function createDefaultProductValue(categoryId?: string): ProductFormValue {
  return {
    categoryId: categoryId ?? "",
    name: "",
    slug: "",
    description: "",
    basePrice: "",
    promoPrice: "",
    isActive: true,
    mediaUrls: [""],
    optionDefinitions: [],
    variants: [],
  };
}

function createEditProductValue(product: {
  categoryId: string;
  name: string;
  slug: string;
  description: string | null;
  basePrice: number;
  promoPrice: number | null;
  isActive: boolean;
  mediaUrls: string[];
  optionDefinitions: Array<{
    name: string;
    values: Array<{ value: string }>;
  }>;
  variants: Array<{
    sku: string | null;
    priceOverride: number | null;
    stockOnHand: number;
    isActive: boolean;
    optionCombination: Array<{
      optionValue: {
        value: string;
      };
    }>;
  }>;
}): ProductFormValue {
  return {
    categoryId: product.categoryId,
    name: product.name,
    slug: product.slug,
    description: product.description ?? "",
    basePrice: String(product.basePrice),
    promoPrice: product.promoPrice != null ? String(product.promoPrice) : "",
    isActive: product.isActive,
    mediaUrls: product.mediaUrls.length ? product.mediaUrls : [""],
    optionDefinitions: product.optionDefinitions.map((definition) => ({
      name: definition.name,
      values: definition.values.map((value) => value.value),
    })),
    variants: product.variants.map((variant) => ({
      sku: variant.sku ?? "",
      priceOverride: variant.priceOverride != null ? String(variant.priceOverride) : "",
      stockOnHand: String(variant.stockOnHand),
      isActive: variant.isActive,
      optionValues: variant.optionCombination.map((option) => option.optionValue.value),
    })),
  };
}

function createEmptyOptionDefinition(): ProductOptionDefinitionDraft {
  return { name: "", values: [] };
}

function createEmptyVariant(optionCount: number): ProductVariantDraft {
  return {
    sku: "",
    priceOverride: "",
    stockOnHand: "0",
    isActive: true,
    optionValues: Array.from({ length: optionCount }).map(() => ""),
  };
}

function syncVariantsWithOptionDefinitions(
  variants: ProductVariantDraft[],
  optionDefinitions: ProductOptionDefinitionDraft[],
) {
  return variants.map((variant) => ({
    ...variant,
    optionValues: optionDefinitions.map((definition, index) => {
      const nextValue = variant.optionValues[index] ?? "";

      return definition.values.includes(nextValue) ? nextValue : "";
    }),
  }));
}

function parseInteger(value: string) {
  if (!value.trim()) {
    return undefined;
  }

  return Number.parseInt(value, 10);
}

function buildCreatePayload(value: ProductFormValue): CreateProductDto {
  return {
    categoryId: value.categoryId,
    name: value.name.trim(),
    slug: value.slug.trim(),
    description: value.description.trim() || undefined,
    basePrice: Number.parseInt(value.basePrice, 10),
    promoPrice: parseInteger(value.promoPrice) ?? null,
    isActive: value.isActive,
    mediaUrls: value.mediaUrls.map((url) => url.trim()).filter(Boolean),
    optionDefinitions: value.optionDefinitions
      .map((definition, index) => ({
        name: definition.name.trim(),
        position: index,
        values: Array.from(
          new Set(
            definition.values
              .map((optionValue) => optionValue.trim())
              .filter(Boolean),
          ),
        ),
      }))
      .filter((definition) => definition.name && definition.values.length),
    variants: value.variants.map((variant) => ({
      sku: variant.sku.trim() || undefined,
      priceOverride: parseInteger(variant.priceOverride) ?? null,
      stockOnHand: Number.parseInt(variant.stockOnHand || "0", 10),
      isActive: variant.isActive,
      optionValues: variant.optionValues.map((optionValue) => optionValue.trim()).filter(Boolean),
    })),
  };
}

function buildUpdatePayload(value: ProductFormValue): UpdateProductDto {
  return buildCreatePayload(value);
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Failed to save product";
}

function SectionShell({
  title,
  description,
  children,
  action,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="rounded-[1.5rem] border border-border bg-surface p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="mt-2 text-sm leading-7 text-muted">{description}</p>
        </div>
        {action}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function ProductForm({
  mode,
  categories,
  product,
}: {
  mode: ProductFormMode;
  categories: ProductCategoryOption[];
  product?: {
    id: string;
    categoryId: string;
    name: string;
    slug: string;
    description: string | null;
    basePrice: number;
    promoPrice: number | null;
    isActive: boolean;
    mediaUrls: string[];
    optionDefinitions: Array<{
      name: string;
      values: Array<{ value: string }>;
    }>;
    variants: Array<{
      sku: string | null;
      priceOverride: number | null;
      stockOnHand: number;
      isActive: boolean;
      optionCombination: Array<{
        optionValue: {
          value: string;
        };
      }>;
    }>;
  };
}) {
  const router = useRouter();
  const [value, setValue] = useState<ProductFormValue>(
    mode === "create" || !product
      ? createDefaultProductValue(categories[0]?.id)
      : createEditProductValue(product),
  );
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function updateName(nextName: string) {
    setValue((current) => ({
      ...current,
      name: nextName,
      slug: slugTouched ? current.slug : slugify(nextName),
    }));
  }

  function updateOptionDefinitions(
    updater: (definitions: ProductOptionDefinitionDraft[]) => ProductOptionDefinitionDraft[],
  ) {
    setValue((current) => {
      const nextOptionDefinitions = updater(current.optionDefinitions);

      return {
        ...current,
        optionDefinitions: nextOptionDefinitions,
        variants: syncVariantsWithOptionDefinitions(current.variants, nextOptionDefinitions),
      };
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      if (mode === "create") {
        const createdProduct = await createProductRequest(buildCreatePayload(value));

        setSuccess("Product created");
        router.push(`/admin/products/${createdProduct.id}`);
        router.refresh();
      } else if (product) {
        await updateProductRequest(product.id, buildUpdatePayload(value));
        setSuccess("Product updated");
        router.refresh();
      }
    } catch (nextError) {
      setError(getErrorMessage(nextError));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!product) {
      return;
    }

    const shouldDelete = window.confirm(
      "Delete this product? Products with cart, order, or stock history cannot be deleted.",
    );

    if (!shouldDelete) {
      return;
    }

    setIsDeleting(true);
    setError(null);
    setSuccess(null);

    try {
      await deleteProductRequest(product.id);
      router.push("/admin/catalog");
      router.refresh();
    } catch (nextError) {
      setError(getErrorMessage(nextError));
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <SectionShell
        title={mode === "create" ? "Create Product" : "Edit Product"}
        description="Product mutation sekarang langsung menulis product, option definitions, option values, dan variant combinations ke model Prisma yang benar."
        action={
          <Link
            href="/admin/catalog"
            className="rounded-full border border-border px-4 py-2 text-sm font-medium text-muted transition hover:text-foreground"
          >
            Back to Catalog
          </Link>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium">
            Product Name
            <input
              value={value.name}
              onChange={(event) => updateName(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 outline-none transition focus:border-accent"
            />
          </label>
          <label className="text-sm font-medium">
            Slug
            <input
              value={value.slug}
              onChange={(event) => {
                setSlugTouched(true);
                setValue((current) => ({ ...current, slug: slugify(event.target.value) }));
              }}
              className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 outline-none transition focus:border-accent"
            />
          </label>
          <label className="text-sm font-medium">
            Category
            <select
              value={value.categoryId}
              onChange={(event) =>
                setValue((current) => ({ ...current, categoryId: event.target.value }))
              }
              className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 outline-none transition focus:border-accent"
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                  {category.isActive === false ? " (inactive)" : ""}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium">
            Base Price
            <input
              inputMode="numeric"
              value={value.basePrice}
              onChange={(event) =>
                setValue((current) => ({
                  ...current,
                  basePrice: event.target.value.replace(/[^\d]/g, ""),
                }))
              }
              className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 outline-none transition focus:border-accent"
            />
          </label>
          <label className="text-sm font-medium">
            Promo Price
            <input
              inputMode="numeric"
              value={value.promoPrice}
              onChange={(event) =>
                setValue((current) => ({
                  ...current,
                  promoPrice: event.target.value.replace(/[^\d]/g, ""),
                }))
              }
              className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 outline-none transition focus:border-accent"
            />
          </label>
          <label className="flex items-center gap-3 rounded-2xl border border-border bg-background px-4 py-4 text-sm font-medium md:col-span-2">
            <input
              type="checkbox"
              checked={value.isActive}
              onChange={(event) =>
                setValue((current) => ({ ...current, isActive: event.target.checked }))
              }
            />
            Product is active
          </label>
          <label className="text-sm font-medium md:col-span-2">
            Description
            <textarea
              rows={5}
              value={value.description}
              onChange={(event) =>
                setValue((current) => ({ ...current, description: event.target.value }))
              }
              className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 outline-none transition focus:border-accent"
            />
          </label>
        </div>
      </SectionShell>

      <SectionShell
        title="Media URLs"
        description="Gunakan satu atau beberapa URL gambar untuk storefront dan admin preview."
        action={
          <button
            type="button"
            onClick={() =>
              setValue((current) => ({ ...current, mediaUrls: [...current.mediaUrls, ""] }))
            }
            className="rounded-full border border-border px-4 py-2 text-sm font-medium text-muted transition hover:text-foreground"
          >
            Add URL
          </button>
        }
      >
        <div className="space-y-3">
          {value.mediaUrls.map((mediaUrl, index) => (
            <div key={`${mode}-media-${index}`} className="flex gap-3">
              <input
                value={mediaUrl}
                placeholder="https://example.com/image.jpg"
                onChange={(event) =>
                  setValue((current) => ({
                    ...current,
                    mediaUrls: current.mediaUrls.map((url, urlIndex) =>
                      urlIndex === index ? event.target.value : url,
                    ),
                  }))
                }
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 outline-none transition focus:border-accent"
              />
              <button
                type="button"
                onClick={() =>
                  setValue((current) => ({
                    ...current,
                    mediaUrls:
                      current.mediaUrls.length === 1
                        ? [""]
                        : current.mediaUrls.filter((_, urlIndex) => urlIndex !== index),
                  }))
                }
                className="rounded-full border border-border px-4 py-2 text-sm font-medium text-muted transition hover:text-foreground"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </SectionShell>

      <SectionShell
        title="Option Definitions"
        description="Option value strings harus unik per product supaya mapping variant tidak ambigu."
        action={
          <button
            type="button"
            onClick={() =>
              updateOptionDefinitions((definitions) => [...definitions, createEmptyOptionDefinition()])
            }
            className="rounded-full border border-border px-4 py-2 text-sm font-medium text-muted transition hover:text-foreground"
          >
            Add Option
          </button>
        }
      >
        <div className="space-y-4">
          {!value.optionDefinitions.length ? (
            <p className="rounded-2xl border border-border bg-background px-4 py-4 text-sm text-muted">
              No option definitions yet. Skip this section for simple products.
            </p>
          ) : null}
          {value.optionDefinitions.map((definition, index) => (
            <div
              key={`${mode}-definition-${index}`}
              className="grid gap-4 rounded-[1.25rem] border border-border bg-background p-4 md:grid-cols-[0.9fr_1.1fr_auto]"
            >
              <label className="text-sm font-medium">
                Option Name
                <input
                  value={definition.name}
                  onChange={(event) =>
                    updateOptionDefinitions((definitions) =>
                      definitions.map((item, definitionIndex) =>
                        definitionIndex === index ? { ...item, name: event.target.value } : item,
                      ),
                    )
                  }
                  className="mt-2 w-full rounded-2xl border border-border bg-surface px-4 py-3 outline-none transition focus:border-accent"
                />
              </label>
              <label className="text-sm font-medium">
                Values
                <input
                  value={definition.values.join(", ")}
                  onChange={(event) =>
                    updateOptionDefinitions((definitions) =>
                      definitions.map((item, definitionIndex) =>
                        definitionIndex === index
                          ? {
                              ...item,
                              values: event.target.value
                                .split(",")
                                .map((optionValue) => optionValue.trim())
                                .filter(Boolean),
                            }
                          : item,
                      ),
                    )
                  }
                  placeholder="S, M, L"
                  className="mt-2 w-full rounded-2xl border border-border bg-surface px-4 py-3 outline-none transition focus:border-accent"
                />
              </label>
              <button
                type="button"
                onClick={() =>
                  updateOptionDefinitions((definitions) =>
                    definitions.filter((_, definitionIndex) => definitionIndex !== index),
                  )
                }
                className="self-end rounded-full border border-border px-4 py-3 text-sm font-medium text-muted transition hover:text-foreground"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </SectionShell>

      <SectionShell
        title="Variants"
        description="Setiap variant memilih satu value per option definition. SKU tetap divalidasi unik."
        action={
          <button
            type="button"
            onClick={() =>
              setValue((current) => ({
                ...current,
                variants: [...current.variants, createEmptyVariant(current.optionDefinitions.length)],
              }))
            }
            className="rounded-full border border-border px-4 py-2 text-sm font-medium text-muted transition hover:text-foreground"
          >
            Add Variant
          </button>
        }
      >
        <div className="space-y-4">
          {!value.variants.length ? (
            <p className="rounded-2xl border border-border bg-background px-4 py-4 text-sm text-muted">
              No variants yet. Add at least one variant so stock and pricing can be managed.
            </p>
          ) : null}
          {value.variants.map((variant, index) => (
            <div
              key={`${mode}-variant-${index}`}
              className="rounded-[1.25rem] border border-border bg-background p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold">Variant {index + 1}</h3>
                  <p className="mt-2 text-sm text-muted">
                    SKU, stock, override price, dan option combination dikelola bareng.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setValue((current) => ({
                      ...current,
                      variants: current.variants.filter((_, variantIndex) => variantIndex !== index),
                    }))
                  }
                  className="rounded-full border border-border px-4 py-2 text-sm font-medium text-muted transition hover:text-foreground"
                >
                  Remove Variant
                </button>
              </div>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <label className="text-sm font-medium">
                  SKU
                  <input
                    value={variant.sku}
                    onChange={(event) =>
                      setValue((current) => ({
                        ...current,
                        variants: current.variants.map((item, variantIndex) =>
                          variantIndex === index ? { ...item, sku: event.target.value } : item,
                        ),
                      }))
                    }
                    className="mt-2 w-full rounded-2xl border border-border bg-surface px-4 py-3 outline-none transition focus:border-accent"
                  />
                </label>
                <label className="text-sm font-medium">
                  Price Override
                  <input
                    inputMode="numeric"
                    value={variant.priceOverride}
                    onChange={(event) =>
                      setValue((current) => ({
                        ...current,
                        variants: current.variants.map((item, variantIndex) =>
                          variantIndex === index
                            ? { ...item, priceOverride: event.target.value.replace(/[^\d]/g, "") }
                            : item,
                        ),
                      }))
                    }
                    className="mt-2 w-full rounded-2xl border border-border bg-surface px-4 py-3 outline-none transition focus:border-accent"
                  />
                </label>
                <label className="text-sm font-medium">
                  Stock On Hand
                  <input
                    inputMode="numeric"
                    value={variant.stockOnHand}
                    onChange={(event) =>
                      setValue((current) => ({
                        ...current,
                        variants: current.variants.map((item, variantIndex) =>
                          variantIndex === index
                            ? { ...item, stockOnHand: event.target.value.replace(/[^\d]/g, "") }
                            : item,
                        ),
                      }))
                    }
                    className="mt-2 w-full rounded-2xl border border-border bg-surface px-4 py-3 outline-none transition focus:border-accent"
                  />
                </label>
                <label className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-4 text-sm font-medium md:col-span-3">
                  <input
                    type="checkbox"
                    checked={variant.isActive}
                    onChange={(event) =>
                      setValue((current) => ({
                        ...current,
                        variants: current.variants.map((item, variantIndex) =>
                          variantIndex === index ? { ...item, isActive: event.target.checked } : item,
                        ),
                      }))
                    }
                  />
                  Variant is active
                </label>
              </div>
              {value.optionDefinitions.length ? (
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  {value.optionDefinitions.map((definition, definitionIndex) => (
                    <label
                      key={`${mode}-variant-${index}-definition-${definitionIndex}`}
                      className="text-sm font-medium"
                    >
                      {definition.name || `Option ${definitionIndex + 1}`}
                      <select
                        value={variant.optionValues[definitionIndex] ?? ""}
                        onChange={(event) =>
                          setValue((current) => ({
                            ...current,
                            variants: current.variants.map((item, variantIndex) =>
                              variantIndex === index
                                ? {
                                    ...item,
                                    optionValues: current.optionDefinitions.map((_, optionIndex) =>
                                      optionIndex === definitionIndex
                                        ? event.target.value
                                        : item.optionValues[optionIndex] ?? "",
                                    ),
                                  }
                                : item,
                            ),
                          }))
                        }
                        className="mt-2 w-full rounded-2xl border border-border bg-surface px-4 py-3 outline-none transition focus:border-accent"
                      >
                        <option value="">Select value</option>
                        {definition.values.map((optionValue) => (
                          <option key={`${definition.name}-${optionValue}`} value={optionValue}>
                            {optionValue}
                          </option>
                        ))}
                      </select>
                    </label>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </SectionShell>

      {error ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {success}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full bg-accent px-5 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-accent/60"
        >
          {isSubmitting
            ? mode === "create"
              ? "Creating..."
              : "Saving..."
            : mode === "create"
              ? "Create Product"
              : "Save Product"}
        </button>
        {mode === "edit" && product ? (
          <button
            type="button"
            onClick={() => void handleDelete()}
            disabled={isDeleting}
            className="rounded-full border border-red-200 px-5 py-3 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDeleting ? "Deleting..." : "Delete Product"}
          </button>
        ) : null}
      </div>
    </form>
  );
}
