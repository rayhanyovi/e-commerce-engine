import { ModulePlaceholder } from "@/components/ui/module-placeholder";
import { mockOrderSummaries } from "@/data/mock-store";

export default function OrdersPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10 lg:px-10">
      <ModulePlaceholder
        title="Orders Shell"
        description="Order history route sudah final di App Router. Data, payment instructions, dan proof upload akan dihubungkan setelah orders dan payments domain dipindahkan."
        bullets={[
          "Route /orders akan jadi customer self-service order history.",
          "Ownership checks dan session gating belum diaktifkan karena auth foundation belum masuk.",
          "Payment proof UI akan dipindahkan setelah mock payment strategy dikunci.",
          "Status badge di bawah ini hanya sample dari state machine source lama.",
        ]}
      />

      <section className="space-y-4">
        {mockOrderSummaries.map((order) => (
          <div key={order.id} className="rounded-[1.5rem] border border-border bg-surface p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-semibold">{order.id}</h2>
                <p className="mt-1 text-sm text-muted">{order.summary}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded-full border border-border px-3 py-1 text-sm text-muted">
                  {order.status}
                </span>
                <span className="text-lg font-semibold">{order.total}</span>
              </div>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
