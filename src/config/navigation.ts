export interface NavigationItem {
  href: string;
  label: string;
  matchPrefixes?: string[];
}

export const storefrontNav: NavigationItem[] = [
  { href: "/", label: "Home" },
  { href: "/categories", label: "Categories" },
  { href: "/products", label: "Products" },
  { href: "/cart", label: "Cart" },
  { href: "/checkout", label: "Checkout" },
  { href: "/addresses", label: "Addresses" },
  { href: "/orders", label: "Orders" },
  { href: "/profile", label: "Profile" },
];

export const adminNav: NavigationItem[] = [
  { href: "/admin", label: "Dashboard" },
  {
    href: "/admin/catalog",
    label: "Catalog",
    matchPrefixes: ["/admin/catalog", "/admin/products"],
  },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/inventory", label: "Inventory" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/payments", label: "Payments" },
  { href: "/admin/promotions", label: "Promotions" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/settings", label: "Settings" },
  { href: "/admin/audit", label: "Audit" },
];

export function isNavigationItemActive(
  pathname: string,
  item: NavigationItem,
) {
  if (pathname === item.href) {
    return true;
  }

  if (item.href !== "/" && pathname.startsWith(`${item.href}/`)) {
    return true;
  }

  return (item.matchPrefixes ?? []).some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}
