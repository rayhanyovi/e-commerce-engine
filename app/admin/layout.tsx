import { AdminShell } from "@/components/layout/admin-shell";
import { getStoreRuntimeConfig } from "@/server/store-config";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const storeConfig = await getStoreRuntimeConfig();

  return <AdminShell storeName={storeConfig.storeName}>{children}</AdminShell>;
}
