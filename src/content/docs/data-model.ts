import type { Metadata } from "next";

export const dataModelMetadata: Metadata = {
  title: "Data Model | E-Commerce Engine Docs",
  description:
    "Reference for the 20+ Prisma models and 10 enums that define the e-commerce engine database schema, including core entities, enums, and design decisions.",
};

export const dataModelPageContent = {
  eyebrow: "Architecture",
  title: "Data Model",
  description:
    "The engine database is defined by 20+ Prisma models and 10 enums covering users, catalog, orders, payments, promotions, inventory, and auditing. This page documents the core entities, their key fields, and the design decisions behind the schema.",
  overview:
    "The schema is organized around a handful of core entities that drive the entire commerce flow. Users browse products organized into categories, add product variants to carts, proceed through checkout to create orders, and submit payment proofs for manual review. Promotions and inventory management operate alongside this core flow.",
  entities: [
    {
      title: "User",
      description:
        "Represents both customers and administrators. Every authenticated action is tied to a user record. The role field controls access to admin-only endpoints and dashboard pages.",
      fields: [
        { name: "id", type: "String (CUID)", notes: "Primary key, globally unique" },
        { name: "email", type: "String", notes: "Unique, used for authentication" },
        { name: "name", type: "String", notes: "Display name for UI and order snapshots" },
        { name: "passwordHash", type: "String", notes: "Bcrypt hash, never stored in plain text" },
        { name: "role", type: "UserRole", notes: "CUSTOMER or ADMIN" },
        { name: "phone", type: "String?", notes: "Optional contact number" },
      ],
    },
    {
      title: "Product",
      description:
        "The central catalog entity. Products belong to categories and have one or more variants that carry pricing, SKU, and inventory data. The product itself holds shared metadata like name, slug, description, and images.",
      fields: [
        { name: "id", type: "String (CUID)", notes: "Primary key" },
        { name: "name", type: "String", notes: "Product display name" },
        { name: "slug", type: "String", notes: "Unique, URL-safe identifier" },
        { name: "description", type: "String?", notes: "Optional rich text description" },
        { name: "categoryId", type: "String", notes: "Foreign key to Category" },
        { name: "isActive", type: "Boolean", notes: "Controls storefront visibility" },
      ],
    },
    {
      title: "Order",
      description:
        "Created when a customer completes checkout. Orders snapshot the customer details, shipping address, line items with prices, and applied promotions at the moment of placement. This ensures order history remains accurate even if products or addresses change later.",
      fields: [
        { name: "id", type: "String (CUID)", notes: "Primary key" },
        { name: "orderNumber", type: "String", notes: "Human-readable sequential number" },
        { name: "status", type: "OrderStatus", notes: "Current lifecycle stage" },
        {
          name: "customerSnapshot",
          type: "Json",
          notes: "Frozen customer name, email, phone at order time",
        },
        {
          name: "addressSnapshot",
          type: "Json",
          notes: "Frozen shipping address at order time",
        },
        {
          name: "totalAmount",
          type: "Int",
          notes: "Total in smallest currency unit (for example cents)",
        },
        { name: "userId", type: "String", notes: "Foreign key to User" },
      ],
    },
  ],
  enumsIntro:
    "The schema defines 10 enums that constrain status fields, type discriminators, and role assignments across the database. These enums are mirrored as TypeScript unions via the generated Prisma client.",
  enums: [
    { name: "UserRole", values: "CUSTOMER, ADMIN", usedBy: "User.role" },
    { name: "CartStatus", values: "ACTIVE, CONVERTED, ABANDONED", usedBy: "Cart.status" },
    {
      name: "OrderStatus",
      values: "PENDING_PAYMENT, PAYMENT_REVIEW, PAID, PROCESSING, SHIPPED, COMPLETED, CANCELLED",
      usedBy: "Order.status",
    },
    { name: "PaymentMethod", values: "MANUAL_TRANSFER", usedBy: "Payment.method" },
    {
      name: "PaymentStatus",
      values: "PENDING, SUBMITTED, UNDER_REVIEW, CONFIRMED, REJECTED",
      usedBy: "Payment.status",
    },
    {
      name: "DiscountType",
      values: "PERCENTAGE, FIXED_AMOUNT, FREE_PRODUCT, FREE_SHIPPING",
      usedBy: "Promotion.discountType",
    },
    {
      name: "PromotionScopeType",
      values: "ALL_PRODUCTS, CATEGORY, PRODUCT, VARIANT",
      usedBy: "PromotionScope.scopeType",
    },
    {
      name: "ReservationStatus",
      values: "ACTIVE, RELEASED, CONSUMED, EXPIRED",
      usedBy: "StockReservation.status",
    },
    {
      name: "StockMovementType",
      values: "ADJUSTMENT_IN, ADJUSTMENT_OUT, ORDER_RESERVE, ORDER_CANCEL_RELEASE, ORDER_CONSUME, INITIAL_STOCK",
      usedBy: "StockMovement.type",
    },
    {
      name: "AuditActorType",
      values: "ADMIN, SYSTEM, CUSTOMER",
      usedBy: "AuditLog.actorType",
    },
  ],
  designDecisions: [
    {
      title: "CUIDs for primary keys.",
      body:
        "Every model uses CUID strings as primary keys instead of auto-incrementing integers. CUIDs are globally unique, URL-safe, and do not leak row counts or creation order. They can be generated client-side for optimistic inserts without risking collisions.",
    },
    {
      title: "Snapshot fields in orders.",
      body:
        "Orders store customerSnapshot, addressSnapshot, and per-line-item price snapshots as JSON columns. This freezes the customer details, shipping address, product names, and prices at the moment of order placement. Even if a customer updates their profile or a product price changes, the historical order record remains accurate and auditable.",
    },
    {
      title: "Indexes for query patterns.",
      body:
        "The schema includes composite indexes on frequently filtered columns such as (userId, status) on orders and (categoryId, isActive) on products. These indexes are designed around the actual query patterns used by the storefront and admin dashboard, not speculative optimization.",
    },
    {
      title: "Cascade deletes.",
      body:
        "Dependent records like cart items, order items, and stock movements use cascade deletes tied to their parent. Deleting a cart removes all its items; deleting a product variant cascades to its stock movements and reservations. This keeps the database referentially consistent without requiring manual cleanup in application code.",
    },
  ],
  calloutTitle: "Explore the Schema",
  calloutBody:
    "The Prisma schema at prisma/schema.prisma is the canonical data reference. Run npx prisma studio to explore the database visually, or npx prisma db pull to introspect an existing database.",
} as const;
