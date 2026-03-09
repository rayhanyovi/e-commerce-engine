import { StorefrontLayout } from "@/components/layout/storefront-layout";
import { getStoreRuntimeConfig } from "@/server/store-config";

export default async function StorefrontRouteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const storeConfig = await getStoreRuntimeConfig();

  return <StorefrontLayout storeName={storeConfig.storeName}>{children}</StorefrontLayout>;
}
