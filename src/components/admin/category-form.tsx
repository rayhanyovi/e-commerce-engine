"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  createCategoryRequest,
  deleteCategoryRequest,
  updateCategoryRequest,
} from "@/lib/categories/client";
import type { CreateCategoryDto, UpdateCategoryDto } from "@/shared/contracts";

type CategoryFormMode = "create" | "edit";

interface CategoryFormValue {
  name: string;
  slug: string;
  isActive: boolean;
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function createDefaultValue(): CategoryFormValue {
  return {
    name: "",
    slug: "",
    isActive: true,
  };
}

function createEditValue(category: {
  name: string;
  slug: string;
  isActive: boolean;
}): CategoryFormValue {
  return {
    name: category.name,
    slug: category.slug,
    isActive: category.isActive,
  };
}

function buildCreatePayload(value: CategoryFormValue): CreateCategoryDto {
  return {
    name: value.name.trim(),
    slug: value.slug.trim(),
    isActive: value.isActive,
  };
}

function buildUpdatePayload(value: CategoryFormValue): UpdateCategoryDto {
  return {
    name: value.name.trim(),
    slug: value.slug.trim(),
    isActive: value.isActive,
  };
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Failed to save category";
}

export function CategoryForm({
  mode,
  category,
}: {
  mode: CategoryFormMode;
  category?: {
    id: string;
    name: string;
    slug: string;
    isActive: boolean;
  };
}) {
  const router = useRouter();
  const [value, setValue] = useState<CategoryFormValue>(
    mode === "create" || !category ? createDefaultValue() : createEditValue(category),
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

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      if (mode === "create") {
        await createCategoryRequest(buildCreatePayload(value));
        setValue(createDefaultValue());
        setSlugTouched(false);
        setSuccess("Category created");
      } else if (category) {
        await updateCategoryRequest(category.id, buildUpdatePayload(value));
        setSuccess("Category updated");
      }

      router.refresh();
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!category) {
      return;
    }

    const shouldDelete = window.confirm(
      "Delete this category? Products still linked to it will block the deletion.",
    );

    if (!shouldDelete) {
      return;
    }

    setIsDeleting(true);
    setError(null);
    setSuccess(null);

    try {
      await deleteCategoryRequest(category.id);
      router.refresh();
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`rounded-[1.5rem] border border-border ${
        mode === "create" ? "bg-surface p-5" : "bg-background p-4"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">
            {mode === "create" ? "Create Category" : "Edit Category"}
          </h2>
          <p className="mt-2 text-sm leading-7 text-muted">
            {mode === "create"
              ? "Category CRUD sekarang punya workspace admin sendiri, bukan cuma preview list di admin catalog."
              : "Perubahan name, slug, dan active status langsung menulis ke catalog module yang sama."}
          </p>
        </div>
        {category ? (
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              category.isActive
                ? "bg-emerald-100 text-emerald-800"
                : "bg-slate-200 text-slate-700"
            }`}
          >
            {category.isActive ? "Active" : "Inactive"}
          </span>
        ) : null}
      </div>

      <div className="mt-5 grid gap-4">
        <label className="text-sm font-medium">
          Category Name
          <input
            value={value.name}
            onChange={(event) => updateName(event.target.value)}
            placeholder="Shoes"
            className="mt-2 w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none transition focus:border-accent"
          />
        </label>

        <label className="text-sm font-medium">
          Slug
          <input
            value={value.slug}
            onChange={(event) => {
              setSlugTouched(true);
              setValue((current) => ({
                ...current,
                slug: slugify(event.target.value),
              }));
            }}
            placeholder="shoes"
            className="mt-2 w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none transition focus:border-accent"
          />
        </label>

        <label className="flex items-center gap-3 rounded-2xl border border-border bg-white px-4 py-4 text-sm font-medium">
          <input
            type="checkbox"
            checked={value.isActive}
            onChange={(event) =>
              setValue((current) => ({ ...current, isActive: event.target.checked }))
            }
          />
          Category is active
        </label>
      </div>

      {error ? (
        <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {success ? (
        <p className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {success}
        </p>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-3">
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
              ? "Create Category"
              : "Save Category"}
        </button>

        {mode === "edit" && category ? (
          <button
            type="button"
            onClick={() => void handleDelete()}
            disabled={isDeleting}
            className="rounded-full border border-red-200 px-5 py-3 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDeleting ? "Deleting..." : "Delete Category"}
          </button>
        ) : null}
      </div>
    </form>
  );
}
