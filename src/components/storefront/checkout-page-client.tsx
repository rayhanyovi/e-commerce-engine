"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useEffect, useState } from "react";

import { listMyAddressesRequest } from "@/lib/addresses/client";
import { fetchCheckoutPreview } from "@/lib/checkout/client";
import { formatCurrency } from "@/lib/formatters";
import { placeOrderRequest } from "@/lib/orders/client";
import type { AddressRecord, CheckoutPreviewResult } from "@/shared/contracts";

interface ShippingAddressFormValue {
  recipientName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  district: string;
  city: string;
  postalCode: string;
  notes: string;
}

function parseVoucherCodes(value: string) {
  return value
    .split(/[\n,]+/)
    .map((code) => code.trim())
    .filter(Boolean);
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Checkout request failed";
}

function createEmptyShippingAddress(): ShippingAddressFormValue {
  return {
    recipientName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    district: "",
    city: "",
    postalCode: "",
    notes: "",
  };
}

function syncInlineAddress(address: AddressRecord): ShippingAddressFormValue {
  return {
    recipientName: address.recipientName,
    phone: address.phone,
    addressLine1: address.addressLine1,
    addressLine2: address.addressLine2 ?? "",
    district: address.district ?? "",
    city: address.city ?? "",
    postalCode: address.postalCode ?? "",
    notes: address.notes ?? "",
  };
}

export function CheckoutPageClient() {
  const router = useRouter();
  const [preview, setPreview] = useState<CheckoutPreviewResult | null>(null);
  const [voucherInput, setVoucherInput] = useState("");
  const [shippingAddress, setShippingAddress] = useState<ShippingAddressFormValue>(
    createEmptyShippingAddress(),
  );
  const [savedAddresses, setSavedAddresses] = useState<AddressRecord[]>([]);
  const [selectedAddressMode, setSelectedAddressMode] = useState<"saved" | "new">("new");
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  const [addressBookMessage, setAddressBookMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastAction, setLastAction] = useState<string | null>(null);

  async function loadPreview(voucherCodes: string[], mode: "initial" | "submit" = "submit") {
    if (mode === "submit") {
      setIsSubmitting(true);
    } else {
      setIsLoading(true);
    }

    setError(null);
    setLastAction(null);

    try {
      const nextPreview = await fetchCheckoutPreview({ voucherCodes });

      startTransition(() => {
        setPreview(nextPreview);
      });

      if (mode === "submit") {
        setLastAction("Checkout preview updated");
      }
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      if (mode === "submit") {
        setIsSubmitting(false);
      } else {
        setIsLoading(false);
      }
    }
  }

  async function loadSavedAddresses() {
    setIsLoadingAddresses(true);
    setAddressBookMessage(null);

    try {
      const nextAddresses = await listMyAddressesRequest();
      const defaultAddress = nextAddresses.find((address) => address.isDefault) ?? nextAddresses[0] ?? null;

      setSavedAddresses(nextAddresses);
      setSelectedAddressMode(defaultAddress ? "saved" : "new");
      setSelectedAddressId(defaultAddress?.id ?? null);

      if (defaultAddress) {
        setShippingAddress(syncInlineAddress(defaultAddress));
      } else {
        setAddressBookMessage(
          "No saved addresses yet. Add one from the address book or enter a new shipping address below.",
        );
      }
    } catch (error) {
      const message = getErrorMessage(error);

      setSavedAddresses([]);
      setSelectedAddressId(null);
      setSelectedAddressMode("new");

      if (message === "Authentication required") {
        setAddressBookMessage(
          "Sign in to use saved addresses. You can still prepare a new shipping address here, but order ownership remains tied to an authenticated customer.",
        );
      } else {
        setAddressBookMessage(message);
      }
    } finally {
      setIsLoadingAddresses(false);
    }
  }

  async function handlePlaceOrder() {
    if (!preview) {
      return;
    }

    if (
      selectedAddressMode === "new" &&
      (!shippingAddress.recipientName.trim() ||
        !shippingAddress.phone.trim() ||
        !shippingAddress.addressLine1.trim())
    ) {
      setError("Recipient name, phone, and address line 1 are required for a new shipping address");
      return;
    }

    setIsPlacingOrder(true);
    setError(null);
    setLastAction(null);

    try {
      const orderPayload =
        selectedAddressMode === "saved" && selectedAddressId
          ? {
              shippingAddressId: selectedAddressId,
              shippingMethod: preview.shippingMethod,
              voucherCodes: parseVoucherCodes(voucherInput),
              paymentMethod: "MANUAL_TRANSFER" as const,
            }
          : {
              shippingAddress: {
                recipientName: shippingAddress.recipientName,
                phone: shippingAddress.phone,
                addressLine1: shippingAddress.addressLine1,
                addressLine2: shippingAddress.addressLine2 || undefined,
                district: shippingAddress.district || undefined,
                city: shippingAddress.city || undefined,
                postalCode: shippingAddress.postalCode || undefined,
                notes: shippingAddress.notes || undefined,
              },
              shippingMethod: preview.shippingMethod,
              voucherCodes: parseVoucherCodes(voucherInput),
              paymentMethod: "MANUAL_TRANSFER" as const,
            };

      const order = await placeOrderRequest(
        orderPayload,
        crypto.randomUUID?.() ?? `order_${Date.now()}`,
      );

      router.push(`/orders/${order.id}`);
      router.refresh();
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setIsPlacingOrder(false);
    }
  }

  useEffect(() => {
    void loadPreview([], "initial");
    void loadSavedAddresses();
  }, []);

  useEffect(() => {
    if (selectedAddressMode !== "saved" || !selectedAddressId) {
      return;
    }

    const selectedAddress = savedAddresses.find((address) => address.id === selectedAddressId);

    if (selectedAddress) {
      setShippingAddress(syncInlineAddress(selectedAddress));
    }
  }, [savedAddresses, selectedAddressId, selectedAddressMode]);

  if (isLoading) {
    return (
      <section className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-40 animate-pulse rounded-[1.5rem] border border-border bg-surface"
            />
          ))}
        </div>
        <div className="h-80 animate-pulse rounded-[1.5rem] border border-border bg-surface" />
      </section>
    );
  }

  if (!preview) {
    const requiresLogin = error === "Authentication required";

    return (
      <section className="rounded-[1.75rem] border border-border bg-surface p-8">
        <p className="text-sm uppercase tracking-[0.18em] text-muted">Checkout Preview</p>
        <h1 className="mt-4 text-3xl font-semibold">
          {requiresLogin
            ? "Checkout requires login"
            : error === "Cart is empty"
              ? "Checkout needs an active cart"
              : "Checkout is not available"}
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
          {requiresLogin
            ? "Guest cart is still supported, but checkout finalization now requires an authenticated customer. Sign in or create an account first, then your active cart can continue into checkout."
            : error ??
              "Preview query failed before a checkout summary could be generated from the active cart."}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          {requiresLogin ? (
            <>
              <Link
                href="/login"
                className="rounded-full bg-accent px-5 py-3 text-sm font-medium text-white"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-full border border-border px-5 py-3 text-sm font-medium text-muted transition hover:text-foreground"
              >
                Register
              </Link>
              <Link
                href="/cart"
                className="rounded-full border border-border px-5 py-3 text-sm font-medium text-muted transition hover:text-foreground"
              >
                Back to Cart
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/cart"
                className="rounded-full bg-accent px-5 py-3 text-sm font-medium text-white"
              >
                Review Cart
              </Link>
              <button
                type="button"
                onClick={() => void loadPreview([], "initial")}
                className="rounded-full border border-border px-5 py-3 text-sm font-medium text-muted transition hover:text-foreground"
              >
                Retry Preview
              </button>
            </>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-4">
        <section className="rounded-[1.5rem] border border-border bg-surface p-5">
          <p className="text-sm uppercase tracking-[0.18em] text-muted">Checkout Preview</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            Summary now comes from the live checkout module
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
            Formula subtotal, voucher, shipping, dan total sekarang dihitung dari active cart dan
            `StoreConfig`, lalu order final memakai formula yang sama.
          </p>

          {lastAction ? (
            <p className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {lastAction}
            </p>
          ) : null}

          {error ? (
            <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          ) : null}
        </section>

        <section className="rounded-[1.5rem] border border-border bg-surface p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Shipping Address</h2>
              <p className="mt-3 text-sm leading-7 text-muted">
                Checkout sekarang bisa memakai saved address customer atau inline snapshot baru.
                Saved address default akan dipilih lebih dulu kalau ada.
              </p>
            </div>
            <Link
              href="/addresses"
              className="rounded-full border border-border px-4 py-2 text-sm font-medium text-muted transition hover:text-foreground"
            >
              Manage Addresses
            </Link>
          </div>

          {addressBookMessage ? (
            <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {addressBookMessage}
            </p>
          ) : null}

          {isLoadingAddresses ? (
            <div className="mt-4 space-y-3">
              {Array.from({ length: 2 }).map((_, index) => (
                <div
                  key={index}
                  className="h-28 animate-pulse rounded-[1.25rem] border border-border bg-background"
                />
              ))}
            </div>
          ) : (
            <>
              {savedAddresses.length ? (
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedAddressMode("saved")}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                      selectedAddressMode === "saved"
                        ? "bg-accent text-white"
                        : "border border-border text-muted hover:text-foreground"
                    }`}
                  >
                    Use Saved Address
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedAddressMode("new")}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                      selectedAddressMode === "new"
                        ? "bg-accent text-white"
                        : "border border-border text-muted hover:text-foreground"
                    }`}
                  >
                    Use New Address
                  </button>
                </div>
              ) : null}

              {savedAddresses.length && selectedAddressMode === "saved" ? (
                <div className="mt-4 space-y-3">
                  {savedAddresses.map((address) => (
                    <label
                      key={address.id}
                      className={`flex cursor-pointer gap-4 rounded-[1.25rem] border px-4 py-4 transition ${
                        selectedAddressId === address.id
                          ? "border-accent bg-accent/5"
                          : "border-border bg-background"
                      }`}
                    >
                      <input
                        type="radio"
                        name="saved-address"
                        checked={selectedAddressId === address.id}
                        onChange={() => {
                          setSelectedAddressId(address.id);
                          setSelectedAddressMode("saved");
                        }}
                        className="mt-1"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium">{address.recipientName}</p>
                          {address.isDefault ? (
                            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800">
                              Default
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-2 text-sm text-muted">{address.phone}</p>
                        <p className="mt-2 text-sm leading-7 text-muted">
                          {[
                            address.addressLine1,
                            address.addressLine2,
                            address.district,
                            address.city,
                            address.postalCode,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                        {address.notes ? (
                          <p className="mt-2 text-sm text-muted">Note: {address.notes}</p>
                        ) : null}
                      </div>
                    </label>
                  ))}
                </div>
              ) : null}
            </>
          )}

          {selectedAddressMode === "new" || !savedAddresses.length ? (
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="text-sm font-medium">
                Recipient Name
                <input
                  value={shippingAddress.recipientName}
                  onChange={(event) =>
                    setShippingAddress((current) => ({
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
                  value={shippingAddress.phone}
                  onChange={(event) =>
                    setShippingAddress((current) => ({
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
                  value={shippingAddress.addressLine1}
                  onChange={(event) =>
                    setShippingAddress((current) => ({
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
                  value={shippingAddress.addressLine2}
                  onChange={(event) =>
                    setShippingAddress((current) => ({
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
                  value={shippingAddress.district}
                  onChange={(event) =>
                    setShippingAddress((current) => ({
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
                  value={shippingAddress.city}
                  onChange={(event) =>
                    setShippingAddress((current) => ({
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
                  value={shippingAddress.postalCode}
                  onChange={(event) =>
                    setShippingAddress((current) => ({
                      ...current,
                      postalCode: event.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 outline-none transition focus:border-accent"
                />
              </label>
              <label className="text-sm font-medium md:col-span-2">
                Note
                <textarea
                  rows={3}
                  value={shippingAddress.notes}
                  onChange={(event) =>
                    setShippingAddress((current) => ({
                      ...current,
                      notes: event.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 outline-none transition focus:border-accent"
                />
              </label>
            </div>
          ) : null}
        </section>

        <section className="rounded-[1.5rem] border border-border bg-surface p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Voucher and Promotions</h2>
            <button
              type="button"
              onClick={() => void loadPreview(parseVoucherCodes(voucherInput))}
              disabled={isSubmitting}
              className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-accent/60"
            >
              {isSubmitting ? "Refreshing..." : "Refresh Preview"}
            </button>
          </div>

          <label className="mt-4 block text-sm font-medium">
            Voucher Codes
            <textarea
              rows={3}
              value={voucherInput}
              onChange={(event) => setVoucherInput(event.target.value)}
              placeholder="One code per line or separated by commas"
              className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 outline-none transition focus:border-accent"
            />
          </label>

          {preview.appliedVouchers.length ? (
            <div className="mt-4 space-y-2">
              {preview.appliedVouchers.map((voucher) => (
                <div
                  key={voucher.code}
                  className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
                >
                  {voucher.code} applied: {formatCurrency(voucher.discount)} ({voucher.type})
                </div>
              ))}
            </div>
          ) : null}

          {preview.rejectedVouchers.length ? (
            <div className="mt-4 space-y-2">
              {preview.rejectedVouchers.map((voucher) => (
                <div
                  key={`${voucher.code}-${voucher.reason}`}
                  className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {voucher.code}: {voucher.reason}
                </div>
              ))}
            </div>
          ) : null}
        </section>

        <section className="rounded-[1.5rem] border border-border bg-surface p-5">
          <h2 className="text-lg font-semibold">Payment Mode</h2>
          <p className="mt-3 text-sm leading-7 text-muted">
            Payment masih mock manual transfer. Provider real seperti Xendit akan dipasang setelah
            payment review queue dan proof upload selesai.
          </p>
          <div className="mt-4 rounded-2xl border border-border bg-background px-4 py-4 text-sm text-muted">
            Method preview: manual transfer. Final payment instructions akan diambil dari store
            settings pada batch payments/settings.
          </div>
        </section>
      </div>

      <aside className="rounded-[1.5rem] border border-border bg-surface p-5">
        <p className="text-sm uppercase tracking-[0.18em] text-muted">Order Summary</p>
        <div className="mt-5 space-y-4">
          {preview.items.map((item) => (
            <div
              key={`${item.productId}-${item.productVariantId}`}
              className="rounded-2xl border border-border bg-background px-4 py-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{item.productName}</p>
                  <p className="mt-1 text-sm text-muted">{item.variantLabel || "-"}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted">{item.qty} item(s)</p>
                  <p className="mt-1 font-medium">{formatCurrency(item.lineSubtotal)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-3 text-sm text-muted">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatCurrency(preview.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Product discount</span>
            <span>- {formatCurrency(preview.productDiscountTotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Voucher</span>
            <span>- {formatCurrency(preview.voucherDiscountTotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>{formatCurrency(preview.shippingCost)}</span>
          </div>
          <div className="flex justify-between">
            <span>ETA</span>
            <span>{preview.shippingEtaDays} day(s)</span>
          </div>
          <div className="flex justify-between text-base font-semibold text-foreground">
            <span>Total</span>
            <span>{formatCurrency(preview.grandTotal)}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => void handlePlaceOrder()}
          disabled={isPlacingOrder}
          className="mt-6 w-full rounded-full bg-accent px-5 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-accent/60"
        >
          {isPlacingOrder ? "Placing Order..." : "Place Order"}
        </button>

        <Link
          href="/cart"
          className="mt-3 block rounded-full border border-border px-5 py-3 text-center text-sm font-medium text-muted transition hover:text-foreground"
        >
          Back to Cart
        </Link>

        <p className="mt-4 text-sm leading-6 text-muted">
          Guest cart stays available, but checkout and order placement now require login so order
          ownership, addresses, and payment review stay tied to a real customer account.
        </p>
      </aside>
    </section>
  );
}
