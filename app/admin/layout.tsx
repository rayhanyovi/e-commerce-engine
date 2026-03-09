import { AdminShell } from "@/components/layout/admin-shell";
import { requireServerAdminUser } from "@/server/auth";
import { getStoreRuntimeConfig } from "@/server/store-config";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireServerAdminUser("/admin");
  const storeConfig = await getStoreRuntimeConfig();

  return <AdminShell storeName={storeConfig.storeName}>{children}</AdminShell>;
}
