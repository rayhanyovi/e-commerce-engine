import { ModulePlaceholder } from "@/components/ui/module-placeholder";

export default function AdminDashboardPage() {
  return (
    <ModulePlaceholder
      title="Admin Dashboard Shell"
      description="Admin root sudah dipasang di App Router. Auth guard dan metric cards nyata akan datang setelah server auth dan summary query dipindahkan."
      bullets={[
        "Dashboard akan jadi titik masuk semua domain admin.",
        "Summary metrics lama dari source Nest akan dipindah setelah auth siap.",
        "Sidebar route final sudah dikunci supaya modul lain bisa masuk tanpa ganti URL lagi.",
        "Shell ini sengaja netral agar nanti bisa diisi chart, alerts, dan counts yang real.",
      ]}
    />
  );
}
