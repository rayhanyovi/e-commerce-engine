import { AdminShell } from "@/components/layout/admin-shell";
import { requireServerAdminUser } from "@/server/auth";
import { getStoreRuntimeConfig } from "@/server/store-config";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [admin, storeConfig] = await Promise.all([
    requireServerAdminUser("/admin"),
    getStoreRuntimeConfig(),
  ]);

  return (
    <AdminShell
      storeName={storeConfig.storeName}
      currentUser={{
        name: admin.name,
        email: admin.email,
        role: "ADMIN",
      }}
    >
      {children}
    </AdminShell>
  );
}
