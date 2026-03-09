import { ModulePlaceholder } from "@/components/ui/module-placeholder";

export default function AdminPaymentsPage() {
  return (
    <ModulePlaceholder
      title="Admin Payments Shell"
      description="Payments dimock dulu sesuai guardrail terbaru. Shell ini akan menampung review queue mock sebelum nanti dihubungkan ke provider nyata."
      bullets={[
        "Route final: /admin/payments.",
        "Phase awal tetap mock agar checkout flow bisa selesai dulu.",
        "Setelah parity beres, provider eksternal seperti Xendit bisa dipasang di atas contract baru.",
        "Order-payment state machine akan dibereskan sebelum integrasi provider nyata.",
      ]}
    />
  );
}
