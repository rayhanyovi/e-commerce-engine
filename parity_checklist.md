# Parity Checklist

Status snapshot per 2026-03-10 untuk membandingkan legacy reference di `ecommercestarter/` dengan root Next.js app yang aktif.

Status legend:

- `Done`: parity sudah ada atau behavior penggantinya sudah aktif
- `Changed`: parity ada, tapi route atau contract sengaja dinormalisasi
- `Expanded`: app baru menambah surface di atas legacy baseline
- `Gap`: masih belum selesai atau masih perlu keputusan final

## Storefront Routes

| Legacy route | Legacy source | Next route | Status | Notes |
| --- | --- | --- | --- | --- |
| `/` | `src/pages/storefront/Home.tsx` | `/` | `Done` | Storefront homepage aktif di App Router. |
| `/products` | `src/pages/storefront/Products.tsx` | `/products` | `Done` | Public catalog list live dengan Prisma-backed data. |
| `/products/:slug` | `src/pages/storefront/ProductDetail.tsx` | `/products/[slug]` | `Done` | Detail page live, add-to-cart aktif. |
| `/cart` | `src/pages/storefront/Cart.tsx` | `/cart` | `Done` | Guest cart cookie dan mutation flow aktif. |
| `/checkout` | `src/pages/storefront/Checkout.tsx` | `/checkout` | `Done` | Checkout preview dan place order aktif. |
| `/orders` | `src/pages/storefront/Orders.tsx` | `/orders` | `Done` | Customer order list aktif. |
| n/a | n/a | `/orders/[orderId]` | `Expanded` | Detail order dipisah jadi page dedicated di app baru. |
| `/addresses` | `src/pages/storefront/Addresses.tsx` | `/addresses` | `Done` | Saved addresses flow aktif. |
| `/login` | `src/pages/auth/Login.tsx` | `/login` | `Done` | Cookie-based login aktif. |
| `/register` | `src/pages/auth/Register.tsx` | `/register` | `Done` | Register + session bootstrap aktif. |
| n/a | n/a | `/categories` | `Expanded` | Added as public category landing. |
| n/a | n/a | `/profile` | `Expanded` | Added as storefront profile page. |

## Admin Routes

| Legacy route | Legacy source | Next route | Status | Notes |
| --- | --- | --- | --- | --- |
| `/admin` | `src/pages/admin/Dashboard.tsx` | `/admin` | `Done` | Dashboard summary sudah hidup di server module baru. |
| `/admin/categories` | `src/pages/admin/Categories.tsx` | `/admin/categories` | `Done` | Admin categories page aktif. |
| `/admin/products` | `src/pages/admin/Products.tsx` | `/admin/catalog` | `Changed` | Catalog listing dipindah ke workspace `/admin/catalog`. |
| `/admin/products/new` | `src/pages/admin/ProductCreate.tsx` | `/admin/products/create` | `Changed` | Create route dinormalisasi ke `/create`. |
| `/admin/products/:id` | `src/pages/admin/ProductCreate.tsx` | `/admin/products/[id]` | `Done` | Product editor aktif. |
| `/admin/orders` | `src/pages/admin/Orders.tsx` | `/admin/orders` | `Done` | Admin orders list aktif. |
| n/a | n/a | `/admin/orders/[orderId]` | `Expanded` | Dedicated admin order detail page. |
| `/admin/promotions` | `src/pages/admin/Promotions.tsx` | `/admin/promotions` | `Done` | CRUD promo aktif. |
| `/admin/payments` | `src/pages/admin/Payments.tsx` | `/admin/payments` | `Done` | Manual payment review queue aktif. |
| `/admin/users` | `src/pages/admin/Users.tsx` | `/admin/users` | `Done` | Admin users registry aktif. |
| `/admin/audit` | `src/pages/admin/Audit.tsx` | `/admin/audit` | `Done` | Audit page aktif. |
| `/admin/inventory` | `src/pages/admin/Inventory.tsx` | `/admin/inventory` | `Done` | Adjustment, low stock, movement log aktif. |
| `/admin/settings` | `src/pages/admin/Settings.tsx` | `/admin/settings` | `Done` | Store config management aktif. |

## API Parity

| Legacy endpoint | Next endpoint | Status | Notes |
| --- | --- | --- | --- |
| `POST /auth/register` | `POST /api/auth/register` | `Done` | Same intent, now issues `httpOnly` cookie. |
| `POST /auth/login` | `POST /api/auth/login` | `Done` | Same intent, cookie auth in same-origin Next app. |
| n/a | `POST /api/auth/logout` | `Expanded` | Logout route ditambahkan di app baru. |
| `GET /products` | `GET /api/products` | `Done` | Public product listing live. |
| `GET /products/:slug` | `GET /api/products/[slug]` | `Done` | Public product detail live. |
| `GET /categories` | `GET /api/categories` | `Done` | Public category listing live. |
| `GET /cart` | `GET /api/cart` | `Done` | Same intent, now uses guest cart cookie instead of header token. |
| `DELETE /cart` | `DELETE /api/cart` | `Done` | Same intent. |
| `POST /cart/items` | `POST /api/cart/items` | `Done` | Same intent. |
| `PATCH /cart/items/:itemId` | `PATCH /api/cart/items/[itemId]` | `Done` | Same intent. |
| `DELETE /cart/items/:itemId` | `DELETE /api/cart/items/[itemId]` | `Done` | Same intent. |
| `POST /checkout/preview` | `POST /api/checkout/preview` | `Done` | Same intent. |
| `POST /orders/place` | `POST /api/orders` | `Changed` | REST surface dinormalisasi ke collection resource. |
| `GET /orders/my` | `GET /api/orders` | `Changed` | Customer scoping tetap ada, route dinormalisasi. |
| `GET /orders/my/:orderId` | `GET /api/orders/[orderId]` | `Changed` | Customer scoping tetap ada, route dinormalisasi. |
| `GET /me/addresses` | `GET /api/addresses` | `Changed` | Resource moved out of `/me/*` prefix. |
| `POST /me/addresses` | `POST /api/addresses` | `Changed` | Same owner-only behavior. |
| `PATCH /me/addresses/:id` | `PATCH /api/addresses/[id]` | `Changed` | Same owner-only behavior. |
| `DELETE /me/addresses/:id` | `DELETE /api/addresses/[id]` | `Changed` | Same owner-only behavior. |
| `POST /orders/:orderId/payment-proof` | `POST /api/orders/[orderId]/payment-proof` | `Done` | Customer proof upload live. |
| `GET /orders/:orderId/payment-instructions` | `GET /api/orders/[orderId]/payment-instructions` | `Done` | Customer payment instructions live. |
| `GET /admin/payments/review-queue` | `GET /api/admin/payments/review-queue` | `Done` | Same intent. |
| `POST /admin/payments/:paymentId/review` | `POST /api/admin/payments/[paymentId]/review` | `Done` | Same intent. |
| `GET /admin/promotions` | `GET /api/admin/promotions` | `Done` | Same intent. |
| `POST /admin/promotions` | `POST /api/admin/promotions` | `Done` | Same intent. |
| `PATCH /admin/promotions/:id` | `PATCH /api/admin/promotions/[id]` | `Done` | Same intent. |
| `DELETE /admin/promotions/:id` | `DELETE /api/admin/promotions/[id]` | `Done` | Same intent. |
| `POST /vouchers/validate` | `POST /api/vouchers/validate` | `Done` | Same intent. |
| `GET /admin/categories` | `GET /api/admin/categories` | `Done` | Same intent. |
| `POST /admin/categories` | `POST /api/admin/categories` | `Done` | Same intent. |
| `PATCH /admin/categories/:id` | `PATCH /api/admin/categories/[id]` | `Done` | Same intent. |
| `DELETE /admin/categories/:id` | `DELETE /api/admin/categories/[id]` | `Done` | Same intent. |
| `GET /admin/products` | `GET /api/admin/products` | `Done` | Same intent. |
| `POST /admin/products` | `POST /api/admin/products` | `Done` | Same intent. |
| `GET /admin/products/:id` | `GET /api/admin/products/[id]` | `Done` | Same intent. |
| `PATCH /admin/products/:id` | `PATCH /api/admin/products/[id]` | `Done` | Same intent. |
| `DELETE /admin/products/:id` | `DELETE /api/admin/products/[id]` | `Done` | Same intent. |
| `POST /admin/products/:id/variants` | folded into `POST /api/admin/products` and `PATCH /api/admin/products/[id]` | `Changed` | Variant persistence sekarang dikelola lewat product editor contract, bukan endpoint variant terpisah. |
| `PATCH /admin/variants/:id` | folded into `PATCH /api/admin/products/[id]` | `Changed` | Variant update ikut product mutation contract. |
| `DELETE /admin/variants/:id` | folded into `PATCH /api/admin/products/[id]` | `Changed` | Variant removal ikut product mutation contract. |
| `POST /admin/inventory/adjust` | `POST /api/admin/inventory/adjust` | `Done` | Same intent. |
| `GET /admin/inventory/movements` | `GET /api/admin/inventory/movements` | `Done` | Same intent. |
| `GET /admin/inventory/low-stock` | `GET /api/admin/inventory/low-stock` | `Done` | Same intent. |
| `GET /admin/orders` | `GET /api/admin/orders` | `Done` | Same intent. |
| `GET /admin/orders/:id` | `GET /api/admin/orders/[id]` | `Done` | Same intent. |
| `PATCH /admin/orders/:id/status` | `PATCH /api/admin/orders/[id]/status` | `Done` | Same intent. |
| `GET /admin/settings` | `GET /api/admin/settings` | `Done` | Same intent. |
| `PATCH /admin/settings` | `PATCH /api/admin/settings` | `Done` | Same intent. |
| n/a | `POST /api/admin/settings/initialize` | `Expanded` | Default config bootstrap ditambahkan di app baru. |
| `GET /admin/dashboard/summary` | `GET /api/admin/dashboard` | `Changed` | Summary endpoint dinormalisasi ke collection root. |
| `GET /admin/audit-logs` | `GET /api/admin/audit` | `Changed` | Audit route name dirapikan. |
| `GET /me` | `GET /api/me` | `Changed` | Session/profile resource dinormalisasi ke same-origin API. |
| `PATCH /me` | `PATCH /api/me` | `Changed` | Same intent. |
| `GET /admin/users` | `GET /api/admin/users` | `Done` | Same intent. |

## Parity Notes

- Root Next app sekarang mencakup semua module inti yang dulu tersebar di legacy storefront React app dan Nest backend.
- Customer API surface sengaja dinormalisasi dari legacy paths seperti `/orders/my` atau `/me/addresses` ke resource-style `/api/orders` dan `/api/addresses`.
- Guest cart di legacy memakai header token; app baru memindahkan identitas guest ke cookie agar cocok dengan same-origin App Router.
- Admin product variant endpoints tidak dipertahankan sebagai route terpisah; editor produk baru mengelola variant lifecycle dalam satu mutation contract.

## Remaining Gaps Before Final Cutover

- E2E storefront happy path belum ada.
- E2E admin payment review path belum ada.
- Keputusan final guest checkout belum didokumentasikan sebagai supported flow atau explicitly unsupported flow.
- Support promotion type `FREE_PRODUCT` masih belum ada.
- Audit log schema masih perlu cleanup final.
- Perlu tanggal cutover yang jelas untuk menghapus `ecommercestarter/` dari workspace aktif.
