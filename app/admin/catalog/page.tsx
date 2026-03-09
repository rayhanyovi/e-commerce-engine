import { ModulePlaceholder } from "@/components/ui/module-placeholder";

export default function AdminCatalogPage() {
  return (
    <ModulePlaceholder
      title="Admin Catalog Shell"
      description="Catalog admin dipisahkan lebih awal untuk menampung categories, products, variants, dan media workflow saat domain catalog mulai dipindahkan."
      bullets={[
        "Source lama punya gap di product list dan variant persistence; shell baru ini jadi target perbaikannya.",
        "Route final: /admin/catalog.",
        "Category CRUD, product CRUD, dan variant management akan digabungkan bertahap di sini.",
        "Data masih menunggu port Prisma dan server contracts baru.",
      ]}
    />
  );
}
