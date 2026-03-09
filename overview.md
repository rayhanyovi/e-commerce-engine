# E-Commerce Engine Overview

## Scope

Dokumen ini merangkum hasil audit codebase saat ini dan memetakan apa yang sudah ada di `ecommercestarter`, apa yang belum beres, serta bagaimana memandangnya sebagai sumber migrasi ke Next.js fullstack.

## Audit Snapshot

- Root project `c:\Projects\e-commerce-engine` saat ini masih Next.js scaffold default (`app/page.tsx`, `app/layout.tsx`, `app/globals.css`).
- Source app yang mau dimigrasikan ada di `ecommercestarter`.
- Source frontend memakai Vite + React 18 + React Router + TanStack Query + shadcn/ui + Tailwind 3.
- Source backend ditulis dengan pola NestJS + Prisma + shared Zod contracts, tetapi belum tersusun sebagai workspace yang benar-benar runnable.
- Shared contracts ada di `ecommercestarter/packages/contracts/src`.
- `ecommercestarter` belum punya `node_modules`, jadi frontend source belum bisa diverifikasi dengan build/test di workspace saat ini.
- `npm run build` di root gagal karena `tsconfig.json` root meng-include `ecommercestarter/backend/src/**/*.ts`, sementara dependency NestJS tidak ada di root package.

## Workspace Map

| Path | Peran |
| --- | --- |
| `app/` | Target Next.js App Router yang masih kosong/default |
| `ecommercestarter/src/` | Source frontend Vite |
| `ecommercestarter/backend/src/` | Source backend bergaya NestJS |
| `ecommercestarter/backend/prisma/schema.prisma` | Model database utama |
| `ecommercestarter/packages/contracts/src/` | Shared Zod schemas, envelopes, error codes |
| `ecommercestarter/src/hooks/` | Hook data-access dan state utama |
| `ecommercestarter/src/pages/` | Seluruh page React Router untuk storefront/admin/auth |
| `ecommercestarter/src/layouts/` | Layout storefront dan admin |
| `ecommercestarter/src/components/ui/` | Komponen shadcn/ui hasil generate |

## Current Feature Inventory

### Storefront

- Auth customer: register, login, logout, load current user.
- Catalog browsing: list products, filter kategori, search, sort.
- Product detail: variant picker, stock display, add to cart.
- Cart: list item, update qty, remove item, clear cart.
- Checkout: pilih alamat tersimpan atau input baru, voucher preview, shipping preview, place order.
- Order history: list order, expand item detail, lihat payment status.
- Payment proof upload: submit `filePath`/URL dan note.
- Address book: CRUD address + default address handling.

### Admin

- Dashboard summary: orders today, last 7 days, pending payment, paid orders, low stock.
- Categories: CRUD.
- Products: create form ada, tetapi listing page masih placeholder dan edit flow belum jadi.
- Orders: list, detail modal, update status.
- Promotions: CRUD voucher/promotion.
- Payments: review queue, confirm/reject proof.
- Users: list registered users.
- Inventory: manual stock adjustment, movement log, low stock list.
- Audit log: list audit records.
- Settings: edit store config key-value.

## Frontend Architecture

### Entry and Providers

- `src/main.tsx` merender `App`.
- `src/App.tsx` memasang:
  - `QueryClientProvider`
  - `TooltipProvider`
  - `Toaster` / `Sonner`
  - `BrowserRouter`
  - `AuthProvider`

### Route Map

| Source route | Tujuan |
| --- | --- |
| `/login` | Login page |
| `/register` | Register page |
| `/` | Storefront home |
| `/products` | Product listing |
| `/products/:slug` | Product detail |
| `/cart` | Cart |
| `/checkout` | Checkout |
| `/orders` | My orders |
| `/addresses` | Address book |
| `/admin` | Admin dashboard |
| `/admin/categories` | Category CRUD |
| `/admin/products` | Product listing placeholder |
| `/admin/products/new` | Product create |
| `/admin/products/:id` | Mengarah ke form create yang sama, edit belum benar-benar diimplementasikan |
| `/admin/orders` | Admin orders |
| `/admin/promotions` | Admin promotions |
| `/admin/payments` | Payment review |
| `/admin/users` | User list |
| `/admin/audit` | Audit log |
| `/admin/inventory` | Inventory |
| `/admin/settings` | Store settings |

### Layouts

- `StorefrontLayout`
  - Header, nav, cart button, login/logout controls.
  - Link ke `/categories` dan `/profile`, tetapi route/page untuk dua path itu belum ada.
- `AdminLayout`
  - Sidebar admin.
  - Redirect ke `/login` bila user bukan admin.

### Hook Inventory

| Hook | Peran | Endpoint/API yang dipakai |
| --- | --- | --- |
| `use-auth` | Auth context, profile bootstrap, login/register/logout | `/auth/login`, `/auth/register`, `/me` |
| `use-cart` | Fetch cart, add/update/remove/clear item, guest token | `/cart`, `/cart/items`, `/cart/items/:itemId` |
| `use-products` | Public/admin product query dan product mutation | `/products`, `/products/:slug`, `/admin/products` |
| `use-orders` | Place order, my orders, admin orders, update status | `/orders/place`, `/orders/my`, `/admin/orders` |
| `use-payments` | Payment instructions, upload proof, admin review queue | `/orders/:id/payment-instructions`, `/orders/:id/payment-proof`, `/admin/payments/...` |
| `use-promotions` | Promotion CRUD, checkout preview, voucher validation | `/admin/promotions`, `/checkout/preview`, `/vouchers/validate` |
| `use-categories` | Public/admin category query and CRUD | `/categories`, `/admin/categories` |
| `use-inventory` | Stock movement list, low stock, adjust stock | `/admin/inventory/movements`, `/admin/inventory/low-stock`, `/admin/inventory/adjust` |
| `use-addresses` | Address book CRUD | `/me/addresses` |
| `use-mobile` | Responsive helper | browser-only media query |
| `use-toast` | Toast state helper | local UI utility |

### Frontend State Notes

- Auth token disimpan di `localStorage` sebagai `auth_token`.
- Guest cart identity disimpan di `localStorage` sebagai `guest_cart_token`.
- Semua request lewat `src/lib/api-client.ts` berbasis `axios`.
- Request interceptor:
  - attach `Authorization: Bearer ...` bila login.
  - attach `X-Guest-Token` bila tidak login.
- Data fetching dominan memakai React Query.

### Styling Notes

- Source UI memakai shadcn/ui dengan `components.json` mode `rsc: false`.
- Styling lama masih Tailwind 3 + `@tailwind base/components/utilities`.
- Root Next app memakai Tailwind 4 syntax `@import "tailwindcss"`.
- Design token lama ada di `ecommercestarter/src/index.css` dan perlu dipindahkan manual saat migrasi.

## Backend Architecture

### Module Inventory

| Module | Tanggung jawab utama |
| --- | --- |
| `auth` | Register, login, JWT validation |
| `users` | `me`, update profile, admin users |
| `categories` | Public/admin category CRUD |
| `products` | Public/admin product query, create/update/delete, variant sub-routes |
| `cart` | Active cart lookup/create, cart items |
| `orders` | Checkout preview, place order, my orders, admin orders, order status update |
| `payments` | Upload payment proof, payment instructions, review queue |
| `promotions` | Promotion CRUD, voucher validation |
| `addresses` | Address CRUD per user |
| `inventory` | Manual stock adjustment, movement log, low stock |
| `store-config` | Key-value settings |
| `dashboard` | Admin summary metrics |
| `audit` | Audit log list |

### Infrastructure Layer

- Prisma service untuk DB access.
- Global exception filter yang membungkus error ke envelope `{ success, data, meta, error }`.
- `AuthGuard` dan `RolesGuard`.
- `ZodValidationPipe`.
- Logger middleware dengan `X-Request-Id`.
- Decorator `@CurrentUser()` dan `@Roles()`.

### Domain Helpers

| Helper | Peran |
| --- | --- |
| `getEffectivePrice` | Prioritas `variant.priceOverride` -> `product.promoPrice` -> `product.basePrice` |
| `isValidStatusTransition` | Aturan transisi status order |
| `checkStockAvailability` | Hitung stok tersedia sesudah reservation |
| `calculateShipping` | Flat shipping + free shipping threshold/voucher |
| `isPromotionEligible` | Aktif/tanggal/usage limit |
| `calculateDiscount` | Discount amount untuk percentage/fixed |

### Shared Contracts

Contracts memakai Zod untuk:

- auth: register, login, update profile
- cart: add item, update qty
- products: query params, create/update product
- categories: create/update category
- orders: place order, update status
- promotions: create/update promotion, validate voucher
- payments: review payment, upload payment proof
- addresses: create/update address
- store config: bulk upsert config
- envelope: pagination + success/error response

## Data Model Summary

Model utama di Prisma:

- `User`
- `Address`
- `Category`
- `Product`
- `ProductOptionDefinition`
- `ProductOptionValue`
- `ProductVariant`
- `VariantOptionCombination`
- `Cart`
- `CartItem`
- `Promotion`
- `PromotionScope`
- `PromotionUsage`
- `Order`
- `OrderItem`
- `Payment`
- `PaymentProof`
- `StockReservation`
- `StockMovement`
- `AuditLog`
- `StoreConfig`

Enum penting:

- `UserRole`: `CUSTOMER`, `ADMIN`
- `OrderStatus`: `PENDING_PAYMENT`, `PAYMENT_REVIEW`, `PAID`, `PROCESSING`, `SHIPPED`, `COMPLETED`, `CANCELLED`
- `PaymentStatus`: `PENDING`, `SUBMITTED`, `UNDER_REVIEW`, `CONFIRMED`, `REJECTED`
- `DiscountType`: `PERCENTAGE`, `FIXED_AMOUNT`, `FREE_PRODUCT`, `FREE_SHIPPING`

## Current End-to-End Flows

### 1. Auth

1. User register/login dari page auth.
2. Backend return `{ user, token }`.
3. Frontend simpan token ke `localStorage`.
4. Saat app mount, `AuthProvider` memanggil `/me`.
5. Role `ADMIN` dipakai untuk akses layout admin.

### 2. Browse Product to Cart

1. User browse `/products` dengan search, category, sort.
2. User buka `/products/:slug`.
3. Variant dipilih dari kombinasi option values.
4. `useCart` memastikan `guest_cart_token` tersedia.
5. Item ditambahkan ke cart via `/cart/items`.

### 3. Checkout Preview

1. Checkout mengambil cart aktif.
2. Jika login, page juga mengambil saved addresses.
3. Voucher codes di-preview lewat `/checkout/preview`.
4. Backend preview menghitung:
   - subtotal
   - product discount dari promo price
   - voucher discount
   - shipping cost
   - grand total

### 4. Place Order

1. Frontend generate `Idempotency-Key`.
2. Backend ambil cart aktif user.
3. Backend validasi produk/variant aktif.
4. Backend cek stok dengan mempertimbangkan active reservations.
5. Backend buat order + order items.
6. Backend buat `StockReservation`.
7. Backend buat `Payment` status `PENDING`.
8. Cart diubah ke `CONVERTED`.

### 5. Payment Proof and Admin Review

1. Customer melihat payment instructions.
2. Customer upload proof (`filePath`, `note`).
3. Backend membuat `PaymentProof`, lalu `Payment.status = SUBMITTED`.
4. Admin melihat review queue.
5. Admin confirm/reject payment.

### 6. Admin Operations

- Categories CRUD.
- Promotion CRUD.
- Order detail dan update status.
- Inventory manual adjustment dan movement log.
- Dashboard summary.
- Settings edit.

## High-Risk Gaps Found During Audit

### Build and Workspace

- Backend NestJS belum punya package/workspace sendiri dan dependency NestJS tidak ada di source package.
- Shared import `@packages/contracts` menunjukkan niat monorepo, tetapi workspace wiring-nya belum ada.
- Root Next build ikut men-typecheck `ecommercestarter/backend/**` sehingga build root sudah gagal sebelum migrasi jalan.

### Auth and Request Context

- `AuthMiddleware` ada, tetapi tidak pernah diregistrasikan ke module mana pun.
- Karena middleware auth tidak terpasang, `req.user` berpotensi selalu kosong dan guarded endpoint tidak akan bekerja benar.

### Checkout and Guest Flow

- Cart mendukung guest token, tetapi checkout preview dan place order diwajibkan login.
- Config `ALLOW_GUEST_CHECKOUT` ada, tetapi belum dipakai dalam flow.
- Storefront seolah mendukung guest cart, tetapi belum mendukung guest checkout end-to-end.

### Order, Payment, and Promotion Consistency

- `CheckoutPreviewService` menghitung voucher/shipping, tetapi `OrdersService.placeOrder` mengabaikan voucher codes dan tidak menyimpan `productDiscountTotal` / `voucherDiscountTotal`.
- Upload proof mengubah `Payment.status` menjadi `SUBMITTED`, tetapi tidak mengubah `Order.status` ke `PAYMENT_REVIEW`.
- Review payment mengubah `Payment.status`, tetapi tidak mengubah `Order.status` ke `PAID` atau `PENDING_PAYMENT`.
- Promotion usage belum tercatat saat order berhasil; `PromotionUsage` dan `totalUsed` belum diupdate.
- Update promotion tidak mengelola `scopes`, jadi edit scope tidak benar-benar diterapkan.

### Product and Inventory

- Service product memakai `tx.variantOptionValue.create`, padahal schema model-nya `VariantOptionCombination`; ini indikasi bug implementasi.
- Product update belum menangani sinkronisasi option definitions dan variants.
- Admin product list page masih placeholder.
- Route edit product sudah ada, tetapi form edit belum diimplementasikan.
- `useAdjustStock` meng-invalidate query key `['admin-products']`, padahal hook product admin memakai key `['admin', 'products', ...]`.

### Schema and Domain Issues

- `AuditLog.entityId` direlasikan ke `Order.id`, padahal audit juga dipakai untuk `PAYMENT`, `PRODUCT`, `PROMOTION`; desain ini berisiko salah secara schema/data integrity.
- Default store config punya method `seedDefaults()`, tetapi belum terlihat dipanggil.
- Payment proof masih berupa string `filePath`; belum ada file upload strategy yang nyata.

### UX / Route Completeness

- `StorefrontLayout` punya link ke `/categories` dan `/profile`, tetapi route/page belum ada.
- `src/pages/Index.tsx` ada, tetapi tidak dipakai router.
- Test coverage praktis belum ada; hanya sample Vitest yang selalu pass.

## Recommended Next.js Target Shape

### Suggested Architecture

- Gunakan App Router sebagai satu-satunya frontend/backend shell.
- Simpan server logic ke `src/server/` atau `lib/server/`.
- Gunakan Prisma langsung dari Next server layer.
- Pertahankan Zod contracts sebagai shared module internal.
- Gunakan Route Handlers untuk HTTP boundary yang masih dibutuhkan.
- Gunakan Server Components untuk query-heavy page yang mostly read-only.
- Gunakan Client Components untuk:
  - auth forms
  - cart interactions
  - voucher input
  - modal/dialog admin
  - payment proof form

### Suggested Route Mapping

| Existing | Next App Router target |
| --- | --- |
| `/` | `app/(storefront)/page.tsx` |
| `/products` | `app/(storefront)/products/page.tsx` |
| `/products/:slug` | `app/(storefront)/products/[slug]/page.tsx` |
| `/cart` | `app/(storefront)/cart/page.tsx` |
| `/checkout` | `app/(storefront)/checkout/page.tsx` |
| `/orders` | `app/(storefront)/orders/page.tsx` |
| `/addresses` | `app/(storefront)/addresses/page.tsx` |
| `/login` | `app/(auth)/login/page.tsx` |
| `/register` | `app/(auth)/register/page.tsx` |
| `/admin` | `app/admin/page.tsx` |
| `/admin/categories` | `app/admin/categories/page.tsx` |
| `/admin/products` | `app/admin/products/page.tsx` |
| `/admin/products/new` | `app/admin/products/new/page.tsx` |
| `/admin/products/:id` | `app/admin/products/[id]/page.tsx` |
| `/admin/orders` | `app/admin/orders/page.tsx` |
| `/admin/promotions` | `app/admin/promotions/page.tsx` |
| `/admin/payments` | `app/admin/payments/page.tsx` |
| `/admin/users` | `app/admin/users/page.tsx` |
| `/admin/audit` | `app/admin/audit/page.tsx` |
| `/admin/inventory` | `app/admin/inventory/page.tsx` |
| `/admin/settings` | `app/admin/settings/page.tsx` |

### Migration Principle

- Pindahkan business rules dulu, bukan sekadar UI.
- Samakan perhitungan preview dan perhitungan final order.
- Rapikan auth/session model lebih dulu sebelum mem-port halaman admin.
- Perlakukan `ecommercestarter` sebagai source reference, bukan code yang bisa langsung dipindahkan mentah.

## What Should Be Preserved

- Struktur domain: catalog, cart, promotion, order, payment, inventory, audit, config.
- Shared contract mindset: Zod schema sebagai boundary tunggal.
- Order idempotency.
- Stock reservation model.
- Manual transfer payment review flow.
- Design tokens dan komponen UI reuse yang memang dipakai.

## What Should Change in Migration

- React Router -> Next App Router.
- LocalStorage bearer auth -> server-friendly session strategy, idealnya cookie/httpOnly.
- Vite axios client thinking -> kombinasi RSC, server actions, route handlers, dan fetch wrapper.
- Tailwind 3 config -> Tailwind 4 setup yang cocok untuk Next.
- Pseudo-monorepo lama -> struktur Next yang benar-benar runnable.

