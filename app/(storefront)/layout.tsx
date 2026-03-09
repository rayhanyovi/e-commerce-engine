import { StorefrontLayout } from "@/components/layout/storefront-layout";

export default function StorefrontRouteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <StorefrontLayout>{children}</StorefrontLayout>;
}
