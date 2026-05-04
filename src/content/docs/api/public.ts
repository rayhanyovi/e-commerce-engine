import type { Metadata } from "next";

const publicEndpoints = [
  { method: "GET", path: "/api/categories", summary: "List public categories", access: "Public" },
  { method: "GET", path: "/api/products", summary: "List and filter products", access: "Public" },
  { method: "GET", path: "/api/products/[slug]", summary: "Get product by slug", access: "Public" },
  { method: "POST", path: "/api/vouchers/validate", summary: "Validate a voucher code", access: "Public" },
  { method: "POST", path: "/api/auth/register", summary: "Create customer account", access: "Public" },
  { method: "POST", path: "/api/auth/login", summary: "Log in with credentials", access: "Public" },
] as const;

export const publicApisMetadata: Metadata = {
  title: "Public APIs | E-Commerce Engine Docs",
  description:
    "Unauthenticated routes for browsing the catalog, validating vouchers, and starting customer auth flows.",
};

export const publicApisPageContent = {
  eyebrow: "API Reference",
  title: "Public APIs",
  description: "Endpoints accessible without authentication.",
  overview:
    "Six endpoints are available without any authentication. They cover browsing the catalog, searching and filtering products, evaluating voucher codes, and creating or authenticating customer accounts. All responses follow the standard ApiEnvelope<T> format.",
  endpoints: publicEndpoints,
  sections: [
    {
      id: "get-categories",
      title: "GET /api/categories",
      paragraphs: [
        "Returns all active product categories in a flat list. Each category includes its slug, display name, and optional parent reference for building hierarchical navigation. No query parameters are required.",
      ],
      codeBlocks: [
        {
          title: "Response shape",
          language: "typescript",
          code: `// ApiEnvelope<CategoryRecord[]>
{
  success: true,
  data: [
    {
      id: string;
      name: string;
      slug: string;
      parentId: string | null;
      sortOrder: number;
    }
  ]
}`,
        },
      ],
    },
    {
      id: "get-products",
      title: "GET /api/products",
      paragraphs: [
        "Lists products with optional filtering and pagination. Supports query parameters for category filtering, keyword search, price range, and sort order. Returns paginated results with total count in the meta field.",
      ],
      codeBlocks: [
        {
          title: "Query parameters",
          language: "typescript",
          code: `interface ProductListQuery {
  categorySlug?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: "price" | "name" | "createdAt";
  sortOrder?: "asc" | "desc";
  page?: number;
  perPage?: number;
}`,
        },
        {
          title: "Response shape",
          language: "typescript",
          code: `// ApiEnvelope<ProductListRecord[]>
{
  success: true,
  data: [
    {
      id: string;
      name: string;
      slug: string;
      basePrice: number;
      promoPrice: number | null;
      thumbnailUrl: string | null;
      categoryName: string;
    }
  ],
  meta: { total: number; page: number; perPage: number }
}`,
        },
      ],
    },
    {
      id: "get-product-slug",
      title: "GET /api/products/[slug]",
      paragraphs: [
        "Fetches a single product by its URL slug, including all variants, images, and active promotions. This is the primary endpoint for rendering product detail pages. Returns a 404 error code if the slug does not match any published product.",
      ],
      codeBlocks: [
        {
          title: "Response shape",
          language: "typescript",
          code: `// ApiEnvelope<ProductDetailRecord>
{
  success: true,
  data: {
    id: string;
    name: string;
    slug: string;
    description: string;
    basePrice: number;
    promoPrice: number | null;
    categoryId: string;
    categoryName: string;
    images: { id: string; url: string; alt: string; sortOrder: number }[];
    variants: {
      id: string;
      sku: string;
      name: string;
      stock: number;
      priceOffset: number;
    }[];
  }
}`,
        },
      ],
    },
    {
      id: "post-vouchers-validate",
      title: "POST /api/vouchers/validate",
      paragraphs: [
        "Validates a voucher code against the current cart or a specific subtotal. Returns the discount type, calculated amount, and any applicability constraints. Use this before checkout to show the customer what savings they will receive.",
      ],
      codeBlocks: [
        {
          title: "Request body",
          language: "typescript",
          code: `interface ValidateVoucherDto {
  code: string;
  subtotal?: number;
}`,
        },
        {
          title: "Response shape",
          language: "typescript",
          code: `// ApiEnvelope<VoucherValidationResult>
{
  success: true,
  data: {
    valid: boolean;
    code: string;
    discountType: "PERCENTAGE" | "FIXED_AMOUNT" | "FREE_PRODUCT" | "FREE_SHIPPING";
    discountValue: number;
    calculatedDiscount: number | null;
    message: string;
  }
}`,
        },
      ],
    },
    {
      id: "post-auth-register",
      title: "POST /api/auth/register",
      paragraphs: [
        "Creates a new customer account and automatically logs the user in by setting a session cookie. The email must be unique across all accounts. Returns the newly created user profile on success.",
      ],
      codeBlocks: [
        {
          title: "Request body",
          language: "typescript",
          code: `interface RegisterDto {
  name: string;
  email: string;
  password: string;
}`,
        },
        {
          title: "Response shape",
          language: "typescript",
          code: `// ApiEnvelope<UserRecord>
{
  success: true,
  data: {
    id: string;
    name: string;
    email: string;
    role: "CUSTOMER";
  }
}`,
        },
      ],
    },
    {
      id: "post-auth-login",
      title: "POST /api/auth/login",
      paragraphs: [
        "Authenticates a user with email and password. On success, a session cookie is set and the user profile is returned. If the user had a guest cart, it is automatically merged into their authenticated cart via the claimGuestCart flow.",
      ],
      codeBlocks: [
        {
          title: "Request body",
          language: "typescript",
          code: `interface LoginDto {
  email: string;
  password: string;
}`,
        },
        {
          title: "Response shape",
          language: "typescript",
          code: `// ApiEnvelope<UserRecord>
{
  success: true,
  data: {
    id: string;
    name: string;
    email: string;
    role: "CUSTOMER" | "ADMIN";
  }
}`,
        },
      ],
    },
  ],
} as const;
