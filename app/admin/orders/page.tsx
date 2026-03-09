import { ModulePlaceholder } from "@/components/ui/module-placeholder";

export default function AdminOrdersPage() {
  return (
    <ModulePlaceholder
      title="Admin Orders Shell"
      description="Order admin page dipasang lebih awal untuk mengunci tempat detail order, update status, dan rekonsiliasi payment-state setelah auth dan orders domain siap."
      bullets={[
        "Route final: /admin/orders.",
        "State machine order akan dipindah bersama audit logging yang benar.",
        "Mismatch status order vs payment dari source lama akan dibenahi di domain migration, bukan di UI shell.",
        "Detail modal source lama akan diubah jadi panel yang lebih cocok untuk App Router.",
      ]}
    />
  );
}
