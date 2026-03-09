import { ModulePlaceholder } from "@/components/ui/module-placeholder";

export default function AdminSettingsPage() {
  return (
    <ModulePlaceholder
      title="Admin Settings Shell"
      description="Store settings admin dipasang di route final untuk menampung store config migration dan seed defaults yang belum benar-benar aktif di source lama."
      bullets={[
        "Route final: /admin/settings.",
        "Config akan tetap key-value, tapi hanya key yang benar-benar dipakai yang dipertahankan.",
        "Payment mock, checkout policy, dan shipping defaults akan dibaca dari sini.",
        "Seed defaults akan dipanggil dari app baru, bukan dibiarkan pasif seperti source lama.",
      ]}
    />
  );
}
