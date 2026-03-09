import { StorefrontLayout } from "@/components/layout/storefront-layout";
import { getServerCurrentUser } from "@/server/auth";
import { getStoreRuntimeConfig } from "@/server/store-config";

export default async function StorefrontRouteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [storeConfig, currentUser] = await Promise.all([
    getStoreRuntimeConfig(),
    getServerCurrentUser(),
  ]);

  return (
    <StorefrontLayout
      storeName={storeConfig.storeName}
      currentUser={
        currentUser
          ? {
              name: currentUser.name,
              role: currentUser.role,
            }
          : null
      }
    >
      {children}
    </StorefrontLayout>
  );
}
