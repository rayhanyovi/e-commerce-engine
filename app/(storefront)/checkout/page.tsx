import { ModulePlaceholder } from "@/components/ui/module-placeholder";

export default function CheckoutPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10 lg:px-10">
      <ModulePlaceholder
        title="Checkout Shell"
        description="Checkout page dipasang lebih awal agar contract shipping address, voucher preview, payment mode, dan order summary bisa dimigrasikan tanpa mengubah route publik."
        bullets={[
          "Payment masih mock dulu sampai provider eksternal dipilih dan auth flow selesai.",
          "Address selection, voucher validation, dan idempotency akan masuk saat checkout domain dipindahkan.",
          "Shell ini menjaga layout parity dengan source lama sambil memindahkan logic sedikit demi sedikit.",
          "Scope berikutnya setelah shell: auth session, cart data, lalu checkout computation server-side.",
        ]}
      />

      <section className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <div className="rounded-[1.5rem] border border-border bg-surface p-5">
            <h2 className="text-lg font-semibold">Shipping Address</h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              Placeholder section untuk saved addresses, guest address, dan address snapshot.
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-border bg-surface p-5">
            <h2 className="text-lg font-semibold">Voucher and Promotions</h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              Placeholder section untuk voucher input, preview total, dan shipping threshold behavior.
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-border bg-surface p-5">
            <h2 className="text-lg font-semibold">Payment Mode</h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              Mock manual payment dulu. Nanti bisa diganti ke provider nyata tanpa mengganti route page.
            </p>
          </div>
        </div>

        <aside className="rounded-[1.5rem] border border-border bg-surface p-5">
          <p className="text-sm uppercase tracking-[0.18em] text-muted">Order Summary</p>
          <div className="mt-5 space-y-3 text-sm text-muted">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>Rp 555.000</span>
            </div>
            <div className="flex justify-between">
              <span>Voucher</span>
              <span>- Rp 0</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>Rp 20.000</span>
            </div>
            <div className="flex justify-between text-base font-semibold text-foreground">
              <span>Total</span>
              <span>Rp 575.000</span>
            </div>
          </div>
          <button className="mt-6 w-full rounded-full bg-accent px-5 py-3 text-sm font-medium text-white">
            Mock Place Order
          </button>
        </aside>
      </section>
    </main>
  );
}
