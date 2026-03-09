import { ModulePlaceholder } from "@/components/ui/module-placeholder";

export default function AdminAuditPage() {
  return (
    <ModulePlaceholder
      title="Admin Audit Shell"
      description="Audit page baru dipasang untuk menjadi target desain ulang audit log yang sekarang masih problematik di schema lama."
      bullets={[
        "Route final: /admin/audit.",
        "Entity relationship audit akan dirapikan sebelum data nyata dipindah.",
        "UI ini akan menampung filter, actor, action, dan payload diff setelah model final ditentukan.",
        "Audit harus konsisten untuk order, payment, promotion, inventory, dan settings.",
      ]}
    />
  );
}
