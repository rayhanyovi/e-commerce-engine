"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { DataState } from "@/components/ui/data-state";
import {
  createAddressRequest,
  deleteAddressRequest,
  listMyAddressesRequest,
  updateAddressRequest,
} from "@/lib/addresses/client";
import { formatDateTime } from "@/lib/formatters";
import type { AddressRecord, CreateAddressDto } from "@/shared/contracts";

interface AddressFormValue {
  recipientName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  district: string;
  city: string;
  postalCode: string;
  notes: string;
  isDefault: boolean;
}

function createEmptyFormValue(): AddressFormValue {
  return {
    recipientName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    district: "",
    city: "",
    postalCode: "",
    notes: "",
    isDefault: false,
  };
}

function createEditFormValue(address: AddressRecord): AddressFormValue {
  return {
    recipientName: address.recipientName,
    phone: address.phone,
    addressLine1: address.addressLine1,
    addressLine2: address.addressLine2 ?? "",
    district: address.district ?? "",
    city: address.city ?? "",
    postalCode: address.postalCode ?? "",
    notes: address.notes ?? "",
    isDefault: address.isDefault,
  };
}

function toAddressDto(value: AddressFormValue): CreateAddressDto {
  return {
    recipientName: value.recipientName.trim(),
    phone: value.phone.trim(),
    addressLine1: value.addressLine1.trim(),
    addressLine2: value.addressLine2.trim() || undefined,
    district: value.district.trim() || undefined,
    city: value.city.trim() || undefined,
    postalCode: value.postalCode.trim() || undefined,
    notes: value.notes.trim() || undefined,
    isDefault: value.isDefault,
  };
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Address request failed";
}

function formatAddressSummary(address: AddressRecord) {
  return [
    address.addressLine1,
    address.addressLine2,
    address.district,
    address.city,
    address.postalCode,
  ]
    .filter(Boolean)
    .join(", ");
}

export function AddressesPageClient() {
  const [addresses, setAddresses] = useState<AddressRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [authRequired, setAuthRequired] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formValue, setFormValue] = useState<AddressFormValue>(createEmptyFormValue());

  const defaultAddress = addresses.find((address) => address.isDefault) ?? null;

  async function loadAddresses() {
    setIsLoading(true);
    setPageError(null);

    try {
      const nextAddresses = await listMyAddressesRequest();

      setAddresses(nextAddresses);
      setAuthRequired(false);
    } catch (error) {
      const message = getErrorMessage(error);

      if (message === "Authentication required") {
        setAuthRequired(true);
        setAddresses([]);
      } else {
        setPageError(message);
      }
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadAddresses();
  }, []);

  function resetForm() {
    setEditingId(null);
    setFormValue(createEmptyFormValue());
  }

  function startEditing(address: AddressRecord) {
    setEditingId(address.id);
    setFormValue(createEditFormValue(address));
    setSubmitError(null);
    setSuccess(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    setSuccess(null);

    try {
      const dto = toAddressDto(formValue);

      if (editingId) {
        await updateAddressRequest(editingId, dto);
        setSuccess("Address updated");
      } else {
        await createAddressRequest(dto);
        setSuccess("Address created");
      }

      resetForm();
      await loadAddresses();
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(addressId: string) {
    const shouldDelete = window.confirm("Delete this address?");

    if (!shouldDelete) {
      return;
    }

    setDeletingId(addressId);
    setSubmitError(null);
    setSuccess(null);

    try {
      await deleteAddressRequest(addressId);

      if (editingId === addressId) {
        resetForm();
      }

      setSuccess("Address deleted");
      await loadAddresses();
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    } finally {
      setDeletingId(null);
    }
  }

  async function handleMakeDefault(addressId: string) {
    setSubmitError(null);
    setSuccess(null);

    try {
      await updateAddressRequest(addressId, { isDefault: true });
      setSuccess("Default address updated");
      await loadAddresses();
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    }
  }

  if (isLoading) {
    return (
      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="h-[480px] animate-pulse rounded-[1.5rem] border border-border bg-surface" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-36 animate-pulse rounded-[1.5rem] border border-border bg-surface"
            />
          ))}
        </div>
      </section>
    );
  }

  if (authRequired) {
    return (
      <DataState
        tone="error"
        eyebrow="Login Required"
        title="Address book needs an authenticated customer"
        description="Saved addresses are private customer data. Sign in first, then you can manage defaults and reuse them during checkout."
        actions={[
          { href: "/login", label: "Login" },
          { href: "/checkout", label: "Back to checkout", variant: "secondary" },
        ]}
      />
    );
  }

  if (pageError) {
    return (
      <DataState
        tone="error"
        eyebrow="Address Error"
        title="Addresses could not be loaded"
        description={pageError}
        actions={[
          { href: "/addresses", label: "Retry" },
          { href: "/", label: "Back to home", variant: "secondary" },
        ]}
      />
    );
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <div className="space-y-6">
        <section className="rounded-[1.5rem] border border-border bg-surface p-5">
          <p className="text-sm uppercase tracking-[0.18em] text-muted">Address Book</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            Saved addresses for faster checkout
          </h1>
          <p className="mt-3 text-sm leading-7 text-muted">
            Customer addresses sekarang bisa disimpan, diedit, dihapus, dan dipilih sebagai
            default. Checkout akan memakai default ini sebagai opsi saved-address pertama.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[1.5rem] border border-border bg-surface p-5">
            <p className="text-sm text-muted">Saved Addresses</p>
            <div className="mt-3 text-3xl font-semibold">{addresses.length}</div>
            <p className="mt-2 text-sm text-muted">Address book customer saat ini.</p>
          </div>
          <div className="rounded-[1.5rem] border border-border bg-surface p-5">
            <p className="text-sm text-muted">Default Address</p>
            <div className="mt-3 text-lg font-semibold">
              {defaultAddress?.recipientName ?? "Not set"}
            </div>
            <p className="mt-2 text-sm text-muted">Dipakai duluan saat checkout saved-address.</p>
          </div>
          <div className="rounded-[1.5rem] border border-border bg-surface p-5">
            <p className="text-sm text-muted">Checkout Ready</p>
            <div className="mt-3 text-3xl font-semibold">
              {addresses.length ? "Yes" : "No"}
            </div>
            <p className="mt-2 text-sm text-muted">Address book ini sudah tersambung ke checkout.</p>
          </div>
        </section>

        <form
          onSubmit={handleSubmit}
          className="rounded-[1.5rem] border border-border bg-surface p-5"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">
                {editingId ? "Edit Address" : "Add Address"}
              </h2>
              <p className="mt-2 text-sm leading-7 text-muted">
                Simpan alamat baru atau ubah alamat yang sudah ada. Default address akan dijaga
                tetap konsisten meskipun address dihapus atau diubah.
              </p>
            </div>
            {editingId ? (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-full border border-border px-4 py-2 text-sm text-muted transition hover:text-foreground"
              >
                Cancel Edit
              </button>
            ) : null}
          </div>

          {submitError ? (
            <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {submitError}
            </p>
          ) : null}

          {success ? (
            <p className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {success}
            </p>
          ) : null}

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="text-sm font-medium">
              Recipient Name
              <input
                value={formValue.recipientName}
                onChange={(event) =>
                  setFormValue((current) => ({
                    ...current,
                    recipientName: event.target.value,
                  }))
                }
                className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 outline-none transition focus:border-accent"
              />
            </label>
            <label className="text-sm font-medium">
              Phone
              <input
                value={formValue.phone}
                onChange={(event) =>
                  setFormValue((current) => ({
                    ...current,
                    phone: event.target.value,
                  }))
                }
                className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 outline-none transition focus:border-accent"
              />
            </label>
            <label className="text-sm font-medium md:col-span-2">
              Address Line 1
              <input
                value={formValue.addressLine1}
                onChange={(event) =>
                  setFormValue((current) => ({
                    ...current,
                    addressLine1: event.target.value,
                  }))
                }
                className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 outline-none transition focus:border-accent"
              />
            </label>
            <label className="text-sm font-medium md:col-span-2">
              Address Line 2
              <input
                value={formValue.addressLine2}
                onChange={(event) =>
                  setFormValue((current) => ({
                    ...current,
                    addressLine2: event.target.value,
                  }))
                }
                className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 outline-none transition focus:border-accent"
              />
            </label>
            <label className="text-sm font-medium">
              District
              <input
                value={formValue.district}
                onChange={(event) =>
                  setFormValue((current) => ({
                    ...current,
                    district: event.target.value,
                  }))
                }
                className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 outline-none transition focus:border-accent"
              />
            </label>
            <label className="text-sm font-medium">
              City
              <input
                value={formValue.city}
                onChange={(event) =>
                  setFormValue((current) => ({
                    ...current,
                    city: event.target.value,
                  }))
                }
                className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 outline-none transition focus:border-accent"
              />
            </label>
            <label className="text-sm font-medium">
              Postal Code
              <input
                value={formValue.postalCode}
                onChange={(event) =>
                  setFormValue((current) => ({
                    ...current,
                    postalCode: event.target.value,
                  }))
                }
                className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 outline-none transition focus:border-accent"
              />
            </label>
            <label className="text-sm font-medium md:col-span-2">
              Notes
              <textarea
                rows={3}
                value={formValue.notes}
                onChange={(event) =>
                  setFormValue((current) => ({
                    ...current,
                    notes: event.target.value,
                  }))
                }
                className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 outline-none transition focus:border-accent"
              />
            </label>
            <label className="flex items-center gap-3 rounded-2xl border border-border bg-background px-4 py-4 text-sm font-medium md:col-span-2">
              <input
                type="checkbox"
                checked={formValue.isDefault}
                onChange={(event) =>
                  setFormValue((current) => ({
                    ...current,
                    isDefault: event.target.checked,
                  }))
                }
              />
              Set as default address
            </label>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-full bg-accent px-5 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-accent/60"
            >
              {isSubmitting
                ? editingId
                  ? "Saving..."
                  : "Creating..."
                : editingId
                  ? "Save Address"
                  : "Add Address"}
            </button>
            <Link
              href="/checkout"
              className="rounded-full border border-border px-5 py-3 text-sm font-medium text-muted transition hover:text-foreground"
            >
              Back to Checkout
            </Link>
          </div>
        </form>
      </div>

      <div className="space-y-4">
        {!addresses.length ? (
          <DataState
            eyebrow="Address Empty"
            title="No saved addresses yet"
            description="Create at least one address here, then you can reuse it from checkout instead of typing it again."
          />
        ) : (
          addresses.map((address) => (
            <section
              key={address.id}
              className="rounded-[1.5rem] border border-border bg-surface p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold">{address.recipientName}</h2>
                    {address.isDefault ? (
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800">
                        Default
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 text-sm text-muted">{address.phone}</p>
                  <p className="mt-3 text-sm leading-7 text-muted">
                    {formatAddressSummary(address)}
                  </p>
                  {address.notes ? (
                    <p className="mt-2 text-sm text-muted">Note: {address.notes}</p>
                  ) : null}
                </div>

                <div className="text-right text-sm text-muted">
                  <p>Updated {formatDateTime(address.updatedAt)}</p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => startEditing(address)}
                  className="rounded-full border border-border px-4 py-2 text-sm text-muted transition hover:text-foreground"
                >
                  Edit
                </button>
                {!address.isDefault ? (
                  <button
                    type="button"
                    onClick={() => void handleMakeDefault(address.id)}
                    className="rounded-full border border-border px-4 py-2 text-sm text-muted transition hover:text-foreground"
                  >
                    Make Default
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => void handleDelete(address.id)}
                  disabled={deletingId === address.id}
                  className="rounded-full border border-red-200 px-4 py-2 text-sm text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {deletingId === address.id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </section>
          ))
        )}
      </div>
    </section>
  );
}
