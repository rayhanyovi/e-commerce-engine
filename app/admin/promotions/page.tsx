import { ModulePlaceholder } from "@/components/ui/module-placeholder";

export default function AdminPromotionsPage() {
  return (
    <ModulePlaceholder
      title="Admin Promotions Shell"
      description="Promotions admin disiapkan untuk voucher CRUD, scope targeting, stacking rules, dan usage tracking yang saat ini belum konsisten di source lama."
      bullets={[
        "Route final: /admin/promotions.",
        "Source lama belum sinkron untuk update scopes dan usage tracking.",
        "Shell ini akan menerima list, form, dan validation flow baru saat promotion domain dipindahkan.",
        "Stacking rule dan max vouchers per order akan diikat ke StoreConfig baru.",
      ]}
    />
  );
}
