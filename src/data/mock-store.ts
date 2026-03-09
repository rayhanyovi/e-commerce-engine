export interface MockProduct {
  slug: string;
  name: string;
  category: string;
  price: number;
  description: string;
  stockLabel: string;
  badge: string;
}

export const mockProducts: MockProduct[] = [
  {
    slug: "artisan-coffee-beans",
    name: "Artisan Coffee Beans",
    category: "Beverages",
    price: 135000,
    description: "Medium roast blend untuk storefront shell. Catalog server wiring akan menggantikan mock ini.",
    stockLabel: "12 bags ready",
    badge: "Featured",
  },
  {
    slug: "linen-weekend-shirt",
    name: "Linen Weekend Shirt",
    category: "Apparel",
    price: 289000,
    description: "Representative product card untuk menguji layout list, detail, dan cart dari App Router baru.",
    stockLabel: "4 variants active",
    badge: "Catalog",
  },
  {
    slug: "ceramic-desk-set",
    name: "Ceramic Desk Set",
    category: "Home Goods",
    price: 420000,
    description: "Mock item untuk baseline checkout, orders, dan cross-link antar page storefront.",
    stockLabel: "Low stock",
    badge: "Checkout",
  },
];

export const mockOrderSummaries = [
  {
    id: "ORD-MOCK-001",
    status: "PENDING_PAYMENT",
    total: "Rp 555.000",
    summary: "2 item, payment masih mocked sebelum wiring provider eksternal.",
  },
  {
    id: "ORD-MOCK-002",
    status: "PAID",
    total: "Rp 289.000",
    summary: "Single-item order untuk placeholder timeline admin dan customer.",
  },
];

export function getMockProductBySlug(slug: string) {
  return mockProducts.find((product) => product.slug === slug);
}
