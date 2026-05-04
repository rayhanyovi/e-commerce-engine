export interface SidebarItem {
  title: string;
  href: string;
  status?: "stable" | "experimental" | "coming-soon";
}

export interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

export const docsSidebar: SidebarSection[] = [
  {
    title: "Getting Started",
    items: [
      { href: "/docs", title: "Overview" },
      { href: "/docs/quickstart", title: "Quickstart" },
      { href: "/docs/environment", title: "Environment Variables" },
      { href: "/docs/project-structure", title: "Project Structure" },
    ],
  },
  {
    title: "Architecture",
    items: [
      { href: "/docs/architecture", title: "Architecture Overview" },
      { href: "/docs/data-model", title: "Data Model" },
      { href: "/docs/api-design", title: "API Design" },
      { href: "/docs/auth", title: "Auth & Sessions" },
    ],
  },
  {
    title: "Commerce Domains",
    items: [
      { href: "/docs/domains/catalog", title: "Catalog & Products" },
      { href: "/docs/domains/cart", title: "Cart" },
      { href: "/docs/domains/checkout", title: "Checkout" },
      { href: "/docs/domains/orders", title: "Orders" },
      { href: "/docs/domains/payments", title: "Payments" },
      { href: "/docs/domains/promotions", title: "Promotions" },
      { href: "/docs/domains/inventory", title: "Inventory" },
      { href: "/docs/domains/addresses", title: "Addresses" },
      { href: "/docs/domains/settings", title: "Store Configuration" },
      { href: "/docs/domains/dashboard", title: "Admin Dashboard" },
      { href: "/docs/domains/audit", title: "Audit Logs" },
    ],
  },
  {
    title: "API Reference",
    items: [
      { href: "/docs/api", title: "API Overview" },
      { href: "/docs/api/public", title: "Public APIs" },
      { href: "/docs/api/customer", title: "Customer APIs" },
      { href: "/docs/api/admin", title: "Admin APIs" },
    ],
  },
  {
    title: "Engine Internals",
    items: [
      { href: "/docs/server-modules", title: "Server Modules" },
      { href: "/docs/domain-helpers", title: "Domain Helpers" },
      { href: "/docs/client-helpers", title: "Client Helpers" },
      { href: "/docs/hooks", title: "Hooks" },
      { href: "/docs/contracts", title: "Contracts & DTOs" },
      { href: "/docs/error-handling", title: "Error Handling" },
    ],
  },
  {
    title: "Guides",
    items: [
      { href: "/docs/guides/building-a-storefront", title: "Building a Storefront" },
      { href: "/docs/guides/customization", title: "Customization" },
      { href: "/docs/guides/deployment", title: "Deployment", status: "experimental" },
    ],
  },
  {
    title: "Roadmap",
    items: [
      { href: "/docs/roadmap/shipping", title: "Shipping Adapters", status: "coming-soon" },
      { href: "/docs/roadmap/payments", title: "Payment Adapters", status: "coming-soon" },
      { href: "/docs/roadmap/email", title: "Email Notifications", status: "coming-soon" },
      { href: "/docs/roadmap/webhooks", title: "Webhooks", status: "coming-soon" },
      { href: "/docs/roadmap/themes", title: "Theme Presets", status: "coming-soon" },
    ],
  },
];
