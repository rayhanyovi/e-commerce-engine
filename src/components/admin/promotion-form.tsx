"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  createPromotionRequest,
  deletePromotionRequest,
  updatePromotionRequest,
} from "@/lib/promotions/client";
import type {
  CreatePromotionDto,
  PromotionScopeInput,
  PromotionScopeType,
  PromotionType,
  UpdatePromotionDto,
} from "@/shared/contracts";

type PromotionFormMode = "create" | "edit";

interface PromotionFormValue {
  code: string;
  type: PromotionType;
  value: string;
  minPurchase: string;
  maxDiscountCap: string;
  validFrom: string;
  validUntil: string;
  totalUsageLimit: string;
  perUserUsageLimit: string;
  isActive: boolean;
  isStackable: boolean;
  scopes: Array<{
    scopeType: PromotionScopeType;
    targetId: string;
  }>;
}

function toDateTimeLocalValue(value: string) {
  const date = new Date(value);
  const timezoneOffset = date.getTimezoneOffset() * 60_000;

  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
}

function createDefaultFormValue(): PromotionFormValue {
  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  return {
    code: "",
    type: "PERCENTAGE",
    value: "10",
    minPurchase: "",
    maxDiscountCap: "",
    validFrom: toDateTimeLocalValue(now.toISOString()),
    validUntil: toDateTimeLocalValue(nextWeek.toISOString()),
    totalUsageLimit: "",
    perUserUsageLimit: "",
    isActive: true,
    isStackable: false,
    scopes: [{ scopeType: "ALL_PRODUCTS", targetId: "" }],
  };
}

function createEditFormValue(promotion: {
  code: string | null;
  type: PromotionType;
  value: number;
  minPurchase: number | null;
  maxDiscountCap: number | null;
  validFrom: string;
  validUntil: string;
  totalUsageLimit: number | null;
  perUserUsageLimit: number | null;
  isActive: boolean;
  isStackable: boolean;
  scopes: Array<{
    scopeType: PromotionScopeType;
    targetId: string | null;
  }>;
}): PromotionFormValue {
  return {
    code: promotion.code ?? "",
    type: promotion.type,
    value: String(promotion.value),
    minPurchase: promotion.minPurchase != null ? String(promotion.minPurchase) : "",
    maxDiscountCap:
      promotion.maxDiscountCap != null ? String(promotion.maxDiscountCap) : "",
    validFrom: toDateTimeLocalValue(promotion.validFrom),
    validUntil: toDateTimeLocalValue(promotion.validUntil),
    totalUsageLimit:
      promotion.totalUsageLimit != null ? String(promotion.totalUsageLimit) : "",
    perUserUsageLimit:
      promotion.perUserUsageLimit != null ? String(promotion.perUserUsageLimit) : "",
    isActive: promotion.isActive,
    isStackable: promotion.isStackable,
    scopes: promotion.scopes.length
      ? promotion.scopes.map((scope) => ({
          scopeType: scope.scopeType,
          targetId: scope.targetId ?? "",
        }))
      : [{ scopeType: "ALL_PRODUCTS", targetId: "" }],
  };
}

function parseInteger(value: string) {
  if (!value.trim()) {
    return undefined;
  }

  return Number.parseInt(value, 10);
}

function sanitizeScopes(scopes: PromotionFormValue["scopes"]): PromotionScopeInput[] {
  return scopes.map((scope) => ({
    scopeType: scope.scopeType,
    targetId: scope.scopeType === "ALL_PRODUCTS" ? null : scope.targetId.trim() || null,
  }));
}

function buildCreatePayload(value: PromotionFormValue): CreatePromotionDto {
  return {
    code: value.code.trim() || null,
    type: value.type,
    value: Number.parseInt(value.value, 10),
    minPurchase: parseInteger(value.minPurchase) ?? null,
    maxDiscountCap: parseInteger(value.maxDiscountCap) ?? null,
    validFrom: new Date(value.validFrom),
    validUntil: new Date(value.validUntil),
    totalUsageLimit: parseInteger(value.totalUsageLimit) ?? null,
    perUserUsageLimit: parseInteger(value.perUserUsageLimit) ?? null,
    isActive: value.isActive,
    isStackable: value.isStackable,
    scopes: sanitizeScopes(value.scopes),
  };
}

function buildUpdatePayload(value: PromotionFormValue): UpdatePromotionDto {
  return {
    code: value.code.trim() || null,
    type: value.type,
    value: Number.parseInt(value.value, 10),
    minPurchase: parseInteger(value.minPurchase) ?? null,
    maxDiscountCap: parseInteger(value.maxDiscountCap) ?? null,
    validFrom: new Date(value.validFrom),
    validUntil: new Date(value.validUntil),
    totalUsageLimit: parseInteger(value.totalUsageLimit) ?? null,
    perUserUsageLimit: parseInteger(value.perUserUsageLimit) ?? null,
    isActive: value.isActive,
    isStackable: value.isStackable,
    scopes: sanitizeScopes(value.scopes),
  };
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Failed to save promotion";
}

function SectionLabel({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="mt-1 text-xs leading-6 text-muted">{description}</p>
    </div>
  );
}

export function PromotionForm({
  mode,
  promotion,
}: {
  mode: PromotionFormMode;
  promotion?: {
    id: string;
    code: string | null;
    type: PromotionType;
    value: number;
    minPurchase: number | null;
    maxDiscountCap: number | null;
    validFrom: string;
    validUntil: string;
    totalUsageLimit: number | null;
    perUserUsageLimit: number | null;
    isActive: boolean;
    isStackable: boolean;
    scopes: Array<{
      id: string;
      scopeType: PromotionScopeType;
      targetId: string | null;
    }>;
    usageCount?: number;
  };
}) {
  const router = useRouter();
  const [value, setValue] = useState<PromotionFormValue>(
    mode === "create" || !promotion
      ? createDefaultFormValue()
      : createEditFormValue(promotion),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function updateScope(
    index: number,
    updates: Partial<PromotionFormValue["scopes"][number]>,
  ) {
    setValue((current) => ({
      ...current,
      scopes: current.scopes.map((scope, scopeIndex) =>
        scopeIndex === index ? { ...scope, ...updates } : scope,
      ),
    }));
  }

  function addScopeRow() {
    setValue((current) => ({
      ...current,
      scopes: [...current.scopes, { scopeType: "PRODUCT", targetId: "" }],
    }));
  }

  function removeScopeRow(index: number) {
    setValue((current) => ({
      ...current,
      scopes:
        current.scopes.length === 1
          ? [{ scopeType: "ALL_PRODUCTS", targetId: "" }]
          : current.scopes.filter((_, scopeIndex) => scopeIndex !== index),
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      if (mode === "create") {
        await createPromotionRequest(buildCreatePayload(value));
        setValue(createDefaultFormValue());
        setSuccess("Promotion created");
      } else if (promotion) {
        await updatePromotionRequest(promotion.id, buildUpdatePayload(value));
        setSuccess("Promotion updated");
      }

      router.refresh();
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!promotion) {
      return;
    }

    const shouldDelete = window.confirm(
      "Delete this promotion? Promotions with usage history cannot be deleted.",
    );

    if (!shouldDelete) {
      return;
    }

    setIsDeleting(true);
    setError(null);
    setSuccess(null);

    try {
      await deletePromotionRequest(promotion.id);
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
            {mode === "create" ? "Create Promotion" : "Edit Promotion"}
          </h2>
          <p className="mt-2 text-sm leading-7 text-muted">
            {mode === "create"
              ? "Voucher CRUD sekarang dibangun langsung di root Next app. Scope target masih diisi lewat target ID agar contract backend stabil dulu."
              : "Perubahan scope sekarang benar-benar tersinkron, bukan cuma update field utama seperti source lama."}
          </p>
        </div>
        {promotion?.usageCount ? (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
            {promotion.usageCount} usage(s)
          </span>
        ) : null}
      </div>

      <div className="mt-5 grid gap-5">
        <div className="grid gap-4 md:grid-cols-[1fr_0.8fr_0.8fr]">
          <label className="text-sm font-medium">
            Code
            <input
              value={value.code}
              onChange={(event) =>
                setValue((current) => ({ ...current, code: event.target.value.toUpperCase() }))
              }
              placeholder="WELCOME10"
              className="mt-2 w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none transition focus:border-accent"
            />
          </label>

          <label className="text-sm font-medium">
            Type
            <select
              value={value.type}
              onChange={(event) =>
                setValue((current) => ({
                  ...current,
                  type: event.target.value as PromotionType,
                  value:
                    event.target.value === "FREE_PRODUCT" &&
                    (!current.value || current.value === "0")
                      ? "1"
                      : current.value,
                }))
              }
              className="mt-2 w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none transition focus:border-accent"
            >
              <option value="PERCENTAGE">Percentage</option>
              <option value="FIXED_AMOUNT">Fixed Amount</option>
              <option value="FREE_SHIPPING">Free Shipping</option>
              <option value="FREE_PRODUCT">Free Product</option>
            </select>
          </label>

          <label className="text-sm font-medium">
            Value
            <input
              inputMode="numeric"
              value={value.value}
              onChange={(event) =>
                setValue((current) => ({
                  ...current,
                  value: event.target.value.replace(/[^\d]/g, ""),
                }))
              }
              className="mt-2 w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none transition focus:border-accent"
            />
            <span className="mt-2 block text-xs leading-6 text-muted">
              {value.type === "FREE_PRODUCT"
                ? "For FREE_PRODUCT, value means how many eligible units become free. The engine discounts the cheapest matching units already present in the cart."
                : value.type === "FREE_SHIPPING"
                  ? "For FREE_SHIPPING, value is kept for contract consistency but shipping cost is what becomes free."
                  : "For percentage and fixed amount promotions, value is the raw discount input consumed by the engine."}
            </span>
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium">
            Valid From
            <input
              type="datetime-local"
              value={value.validFrom}
              onChange={(event) =>
                setValue((current) => ({ ...current, validFrom: event.target.value }))
              }
              className="mt-2 w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none transition focus:border-accent"
            />
          </label>

          <label className="text-sm font-medium">
            Valid Until
            <input
              type="datetime-local"
              value={value.validUntil}
              onChange={(event) =>
                setValue((current) => ({ ...current, validUntil: event.target.value }))
              }
              className="mt-2 w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none transition focus:border-accent"
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium">
            Minimum Purchase
            <input
              inputMode="numeric"
              value={value.minPurchase}
              onChange={(event) =>
                setValue((current) => ({
                  ...current,
                  minPurchase: event.target.value.replace(/[^\d]/g, ""),
                }))
              }
              placeholder="0"
              className="mt-2 w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none transition focus:border-accent"
            />
          </label>

          <label className="text-sm font-medium">
            Max Discount Cap
            <input
              inputMode="numeric"
              value={value.maxDiscountCap}
              onChange={(event) =>
                setValue((current) => ({
                  ...current,
                  maxDiscountCap: event.target.value.replace(/[^\d]/g, ""),
                }))
              }
              placeholder="0"
              className="mt-2 w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none transition focus:border-accent"
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium">
            Total Usage Limit
            <input
              inputMode="numeric"
              value={value.totalUsageLimit}
              onChange={(event) =>
                setValue((current) => ({
                  ...current,
                  totalUsageLimit: event.target.value.replace(/[^\d]/g, ""),
                }))
              }
              placeholder="Optional"
              className="mt-2 w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none transition focus:border-accent"
            />
          </label>

          <label className="text-sm font-medium">
            Per User Limit
            <input
              inputMode="numeric"
              value={value.perUserUsageLimit}
              onChange={(event) =>
                setValue((current) => ({
                  ...current,
                  perUserUsageLimit: event.target.value.replace(/[^\d]/g, ""),
                }))
              }
              placeholder="Optional"
              className="mt-2 w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none transition focus:border-accent"
            />
          </label>
        </div>

        <div className="grid gap-3 rounded-2xl border border-border bg-white p-4">
          <SectionLabel
            title="Scopes"
            description="Gunakan `ALL_PRODUCTS` untuk voucher global, atau isi target ID untuk `CATEGORY`, `PRODUCT`, dan `VARIANT`."
          />

          <div className="space-y-3">
            {value.scopes.map((scope, index) => (
              <div key={`${mode}-${index}`} className="grid gap-3 md:grid-cols-[0.9fr_1.1fr_auto]">
                <select
                  value={scope.scopeType}
                  onChange={(event) =>
                    updateScope(index, {
                      scopeType: event.target.value as PromotionScopeType,
                      targetId:
                        event.target.value === "ALL_PRODUCTS" ? "" : scope.targetId,
                    })
                  }
                  className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none transition focus:border-accent"
                >
                  <option value="ALL_PRODUCTS">All Products</option>
                  <option value="CATEGORY">Category</option>
                  <option value="PRODUCT">Product</option>
                  <option value="VARIANT">Variant</option>
                </select>

                <input
                  value={scope.targetId}
                  disabled={scope.scopeType === "ALL_PRODUCTS"}
                  onChange={(event) => updateScope(index, { targetId: event.target.value })}
                  placeholder={
                    scope.scopeType === "ALL_PRODUCTS" ? "No target required" : "Target ID"
                  }
                  className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none transition focus:border-accent disabled:cursor-not-allowed disabled:bg-slate-100"
                />

                <button
                  type="button"
                  onClick={() => removeScopeRow(index)}
                  className="rounded-full border border-border px-4 py-3 text-sm text-muted transition hover:text-foreground"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addScopeRow}
            className="w-fit rounded-full border border-border px-4 py-2 text-sm text-muted transition hover:text-foreground"
          >
            Add Scope
          </button>
        </div>

        <div className="grid gap-3 rounded-2xl border border-border bg-white p-4 md:grid-cols-2">
          <label className="flex items-center gap-3 text-sm font-medium">
            <input
              type="checkbox"
              checked={value.isActive}
              onChange={(event) =>
                setValue((current) => ({ ...current, isActive: event.target.checked }))
              }
            />
            Promotion is active
          </label>

          <label className="flex items-center gap-3 text-sm font-medium">
            <input
              type="checkbox"
              checked={value.isStackable}
              onChange={(event) =>
                setValue((current) => ({ ...current, isStackable: event.target.checked }))
              }
            />
            Promotion can stack
          </label>
        </div>
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
              ? "Create Promotion"
              : "Save Promotion"}
        </button>

        {mode === "edit" && promotion ? (
          <button
            type="button"
            onClick={() => void handleDelete()}
            disabled={isDeleting}
            className="rounded-full border border-red-200 px-5 py-3 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDeleting ? "Deleting..." : "Delete Promotion"}
          </button>
        ) : null}
      </div>
    </form>
  );
}
