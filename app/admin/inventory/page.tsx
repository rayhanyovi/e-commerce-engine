import { ModulePlaceholder } from "@/components/ui/module-placeholder";

export default function AdminInventoryPage() {
  return (
    <ModulePlaceholder
      title="Admin Inventory Shell"
      description="Inventory adalah salah satu scope awal. Shell ini dipasang supaya adjustment, movement log, dan low-stock monitoring bisa ditanam tanpa mengubah route lagi."
      bullets={[
        "Route final: /admin/inventory.",
        "Manual stock adjustment akan tetap didukung dari source lama.",
        "Movement log order reserve/release/consume akan dipindah bersama orders domain.",
        "Guard negative stock tetap akan dipertahankan saat server logic dipindahkan.",
      ]}
    />
  );
}
