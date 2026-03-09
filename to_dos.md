# Next.js Migration To-Dos

Dokumen ini adalah backlog migrasi A-Z dari source app `ecommercestarter` ke Next.js fullstack. Fokusnya bukan cuma memindahkan UI, tetapi juga memastikan business logic, data consistency, dan operasionalnya benar.

## 0. Baseline and Guardrails

- [x] Putuskan strategi migrasi: root Next app jadi target implementasi utama, `ecommercestarter` hanya dipakai sebagai referensi sampai parity selesai lalu dihapus.
- [x] Tetapkan `ecommercestarter` sebagai source-of-truth referensi sampai seluruh fitur parity tercapai.
- [x] Tetapkan guardrail repo: tidak memakai branch migrasi terpisah, semua pekerjaan masuk langsung ke root workspace.
- [x] Bekukan daftar scope awal berurutan: storefront, admin, auth, inventory, catalog, cart, checkout, payments, orders, promotions, settings, audit.
- [x] Tetapkan guardrail eksekusi: migrasi diperlakukan sebagai rebuild baru dengan `ecommercestarter` sebagai reference, tanpa pemisahan kaku antara `feature parity`, `bug fixes`, dan `architecture cleanup`.

## 1. Workspace and Build Hygiene

- [x] Perbaiki root `tsconfig.json` agar build Next tidak ikut typecheck `ecommercestarter/backend/**`.
- [x] Tetapkan posisi `ecommercestarter`: tetap di repo sebagai reference sementara dan akan dihapus di akhir migrasi.
- [x] Rapikan README root agar menjelaskan bahwa app utama adalah Next.js, bukan scaffold default.
- [x] Putuskan struktur final: semua logic di root app, atau gunakan `src/` tambahan untuk server/shared layer.
- [x] Definisikan alias import yang konsisten untuk app baru.
- [x] Pastikan `npm run build`, `npm run lint`, dan typecheck root bisa jalan sebelum migrasi fitur dimulai.

## 2. Dependency Strategy

- [ ] Tentukan stack target untuk data layer: Prisma tetap dipakai atau ada perubahan.
- [ ] Tentukan auth stack: custom JWT cookie, Lucia/Auth.js, atau solusi internal lain.
- [ ] Tentukan apakah React Query masih dipakai di Next app atau hanya dipakai untuk bagian yang benar-benar client-heavy.
- [ ] Port atau regenerate komponen shadcn/ui agar kompatibel dengan Next + React 19.
- [ ] Rencanakan migrasi Tailwind 3 tokens ke Tailwind 4.
- [x] Tambahkan dependency yang benar-benar diperlukan untuk backend logic di app Next.
- [ ] Hindari membawa dependency source yang tidak terpakai.

## 3. Environment and Configuration

- [ ] Definisikan `.env` contract untuk:
- [ ] `DATABASE_URL`
- [ ] `JWT_SECRET` atau auth secret baru
- [ ] app base URL
- [ ] upload storage config jika payment proof jadi real upload
- [ ] Tambahkan config per environment: local, staging, production.
- [ ] Putuskan timezone default, currency default, dan base locale.

## 4. Database and Prisma

- [ ] Port `schema.prisma` ke app Next.
- [ ] Review ulang semua model dan enum sebelum generate migration pertama.
- [ ] Perbaiki desain `AuditLog` agar tidak hard-link generic `entityId` ke `Order.id`.
- [ ] Review apakah `PromotionUsage` perlu relation yang lebih lengkap ke `Order` dan `User`.
- [ ] Review apakah `PaymentProof.filePath` cukup, atau perlu metadata file yang lebih formal.
- [ ] Jalankan Prisma migration yang benar di workspace baru.
- [ ] Tambahkan script seed.
- [ ] Implement seed untuk default `StoreConfig`.
- [ ] Tambahkan sample seed data untuk categories, products, variants, dan admin user.

## 5. Shared Contracts and Validation

- [x] Pindahkan seluruh Zod schemas dari `packages/contracts` ke shared layer yang benar-benar dipakai app Next.
- [x] Pertahankan envelope response bila route handlers masih exposed ke client.
- [ ] Audit ulang schema yang belum terpakai konsisten.
- [ ] Tambahkan validation untuk endpoint yang saat ini belum memakai Zod pipe.
- [x] Pastikan type inference dari schema tetap menjadi source of truth.

## 6. Server Architecture in Next

- [x] Buat folder server layer, misalnya `src/server/`.
- [ ] Pisahkan module menjadi:
- [ ] `auth`
- [ ] `catalog`
- [ ] `cart`
- [ ] `checkout`
- [ ] `orders`
- [ ] `payments`
- [ ] `promotions`
- [ ] `inventory`
- [ ] `settings`
- [ ] `audit`
- [ ] Port domain helpers:
- [ ] `getEffectivePrice`
- [ ] `isValidStatusTransition`
- [ ] `calculateDiscount`
- [ ] `isPromotionEligible`
- [ ] `calculateShipping`
- [ ] `checkStockAvailability`
- [ ] Tambahkan error normalizer yang konsisten.
- [ ] Tambahkan request logging dan request ID di Next layer bila dibutuhkan.

## 7. Auth and Session

- [ ] Implement register.
- [ ] Implement login.
- [ ] Implement logout.
- [ ] Implement `me` session/profile fetch.
- [ ] Pindahkan penyimpanan auth dari `localStorage` ke cookie/httpOnly atau session mechanism lain yang SSR-friendly.
- [ ] Implement admin role guard untuk route admin dan server actions admin.
- [ ] Implement profile update endpoint/page bila memang dibutuhkan.
- [ ] Putuskan nasib guest cart dan guest checkout:
- [ ] jika guest checkout didukung, implement guest identity cookie end-to-end
- [ ] jika guest checkout tidak didukung, hapus misleading config dan flow

## 8. Catalog Domain

- [ ] Port category list public.
- [ ] Port admin category list.
- [ ] Port category create/update/delete.
- [ ] Port product public listing dengan pagination, search, category filter, sort, price filter.
- [ ] Port product detail by slug.
- [ ] Port admin product list penuh.
- [ ] Port admin product create.
- [ ] Port admin product edit.
- [ ] Port admin product delete.
- [ ] Port variant create/update/delete.
- [ ] Perbaiki logic persistence option definitions dan variant combinations.
- [ ] Ganti implementasi yang salah dari `variantOptionValue` ke model yang benar sesuai Prisma.
- [ ] Tambahkan validasi uniqueness slug dan SKU secara konsisten.

## 9. Cart Domain

- [ ] Port active cart lookup.
- [ ] Port guest cart identity handling bila dibutuhkan.
- [ ] Port add item.
- [ ] Port update qty.
- [ ] Port remove item.
- [ ] Port clear cart.
- [ ] Tambahkan validasi stok dan availability saat add/update cart.
- [ ] Tentukan apakah cart disimpan via API handlers, server actions, atau hybrid.

## 10. Checkout Domain

- [ ] Port checkout preview.
- [ ] Samakan formula preview dengan formula final place order.
- [ ] Gunakan `StoreConfig` untuk shipping cost, ETA, free shipping threshold, max vouchers, stacking rules.
- [ ] Implement voucher validation yang sama antara preview dan order finalization.
- [ ] Pastikan shipping address bisa berasal dari saved address atau inline form.
- [ ] Implement idempotency key handling di Next server layer.
- [ ] Putuskan apakah checkout harus login atau boleh guest.
- [ ] Pastikan `ALLOW_GUEST_CHECKOUT` benar-benar dipakai atau dihapus.

## 11. Orders Domain

- [ ] Port place order.
- [ ] Port my orders list.
- [ ] Port my order detail.
- [ ] Port admin order list.
- [ ] Port admin order detail.
- [ ] Port admin update order status.
- [ ] Pastikan order menyimpan:
- [ ] `productDiscountTotal`
- [ ] `voucherDiscountTotal`
- [ ] `shippingMethod`
- [ ] `shippingEtaDays`
- [ ] `customerSnapshot`
- [ ] `addressSnapshot`
- [ ] Perbaiki `variantLabelSnapshot` agar memakai label variant yang benar, bukan fallback ID sembarang.
- [ ] Pastikan stock reservation dibuat saat order diletakkan.
- [ ] Pastikan reservation release/consume konsisten terhadap perubahan status.

## 12. Payments Domain

- [ ] Port payment instructions.
- [ ] Batasi akses payment instructions ke owner order atau admin bila memang harus private.
- [ ] Port upload payment proof.
- [ ] Putuskan apakah payment proof akan tetap berupa manual URL/path atau pakai upload file sungguhan.
- [ ] Bila pakai upload nyata, tambahkan storage provider dan signed upload flow.
- [ ] Port admin payment review queue.
- [ ] Port confirm payment.
- [ ] Port reject payment.
- [ ] Satukan state machine order-payment:
- [ ] upload proof harus bisa menggeser order ke `PAYMENT_REVIEW`
- [ ] confirm payment harus bisa menggeser order ke `PAID`
- [ ] reject payment harus bisa mengembalikan order ke status yang tepat

## 13. Promotions Domain

- [ ] Port promotion list admin.
- [ ] Port create promotion.
- [ ] Port update promotion.
- [ ] Port delete promotion.
- [ ] Port voucher validation.
- [ ] Perbaiki update promotion agar `scopes` ikut tersinkron.
- [ ] Implement `PromotionUsage` creation saat order sukses.
- [ ] Increment `Promotion.totalUsed` saat voucher benar-benar dipakai.
- [ ] Pastikan per-user limit dan total usage limit benar-benar enforceable.
- [ ] Putuskan support `FREE_PRODUCT`; saat ini logic diskonnya belum benar-benar ada.
- [ ] Pastikan stacking rule dan `MAX_VOUCHERS_PER_ORDER` dijalankan konsisten.

## 14. Inventory Domain

- [ ] Port manual stock adjustment.
- [ ] Port stock movement list.
- [ ] Port low stock list.
- [ ] Pastikan stock movement tercatat juga untuk reserve, consume, dan release order.
- [ ] Tambahkan guard supaya stock tidak pernah negatif.
- [ ] Tambahkan referensi `actorId` dan `referenceId` secara konsisten.

## 15. Addresses Domain

- [ ] Port my addresses list.
- [ ] Port create address.
- [ ] Port update address.
- [ ] Port delete address.
- [ ] Pertahankan logic default address.
- [ ] Tambahkan address selection di checkout yang konsisten dengan saved/new flow.

## 16. Store Config and Settings

- [ ] Port admin settings list.
- [ ] Port admin settings bulk update.
- [ ] Tambahkan initialization path untuk default configs.
- [ ] Pastikan semua config key yang ada benar-benar dipakai business logic.
- [ ] Hapus config yang tidak lagi relevan setelah auth/checkout decision final.

## 17. Dashboard and Audit

- [ ] Port admin dashboard summary.
- [ ] Port audit log list.
- [ ] Putuskan desain audit log final:
- [ ] generic polymorphic log
- [ ] atau audit per entity type
- [ ] Pastikan audit record dibuat untuk order, payment, promotion, inventory, dan settings changes yang penting.

## 18. Storefront Pages

- [x] Buat storefront layout Next.
- [x] Migrasikan homepage.
- [ ] Migrasikan products list page.
- [ ] Migrasikan product detail page.
- [ ] Migrasikan cart page.
- [ ] Migrasikan checkout page.
- [ ] Migrasikan orders page.
- [ ] Migrasikan addresses page.
- [ ] Migrasikan login page.
- [ ] Migrasikan register page.
- [ ] Putuskan apakah `/categories` akan dibuat atau link-nya dihapus.
- [ ] Putuskan apakah `/profile` akan dibuat atau link-nya dihapus.
- [ ] Ganti penggunaan `<img>` external ke strategi `next/image` atau pertahankan `<img>` dengan alasan yang jelas.

## 19. Admin Pages

- [x] Buat admin layout Next.
- [ ] Migrasikan dashboard.
- [ ] Migrasikan categories page.
- [ ] Implementasikan products list yang belum jadi di source app.
- [ ] Migrasikan product create page.
- [ ] Implementasikan product edit page sungguhan.
- [ ] Migrasikan orders page.
- [ ] Migrasikan promotions page.
- [ ] Migrasikan payments page.
- [ ] Migrasikan users page.
- [ ] Migrasikan inventory page.
- [ ] Migrasikan audit page.
- [ ] Migrasikan settings page.

## 20. Client State and Hooks Re-Design

- [ ] Audit hook mana yang tetap relevan di Next app.
- [ ] Ubah hook data-heavy menjadi server-driven bila memungkinkan.
- [ ] Simpan hook client-only untuk form/dialog/local UI state.
- [ ] Buat wrapper auth/session hook yang SSR-safe.
- [ ] Buat cart hook baru yang tidak hard-coded pada `localStorage` saat render server.
- [ ] Pastikan query invalidation key konsisten bila React Query tetap dipakai.

## 21. UI System and Design Tokens

- [ ] Port token warna dari `ecommercestarter/src/index.css`.
- [ ] Port komponen loading/empty/error states.
- [ ] Audit komponen shadcn mana yang benar-benar dipakai.
- [ ] Hapus komponen generated yang tidak dipakai bila sudah aman.
- [ ] Pastikan desain admin dan storefront konsisten di Next app.

## 22. Security and Access Control

- [ ] Pastikan seluruh route admin dilindungi di server, bukan cuma di client.
- [ ] Pastikan endpoint owner-only seperti orders, addresses, payment proof tidak bocor ke user lain.
- [ ] Validasi input file proof bila upload tetap berbasis URL/path.
- [ ] Review CORS sudah tidak relevan bila frontend/backend disatukan dalam Next app.
- [ ] Tambahkan CSRF/session hardening bila auth berbasis cookie.

## 23. Observability and Error Handling

- [ ] Port error envelope atau definisikan standar error baru.
- [ ] Tambahkan structured logging.
- [ ] Tambahkan request ID propagation bila diperlukan.
- [ ] Tambahkan halaman error dan not-found yang proper di App Router.
- [ ] Tangani empty states dan loading states untuk semua page migrasi.

## 24. Testing

- [ ] Tambahkan unit test untuk domain helpers.
- [ ] Tambahkan integration test untuk route handlers/server actions penting.
- [ ] Tambahkan test untuk auth flow.
- [ ] Tambahkan test untuk cart flow.
- [ ] Tambahkan test untuk checkout preview.
- [ ] Tambahkan test untuk place order idempotency.
- [ ] Tambahkan test untuk payment review.
- [ ] Tambahkan test untuk promotion usage limits.
- [ ] Tambahkan test untuk stock reservation and release.
- [ ] Tambahkan E2E untuk storefront happy path.
- [ ] Tambahkan E2E untuk admin payment review path.
- [ ] Ganti placeholder Vitest test dengan test yang benar-benar bernilai.

## 25. Verification and Cutover

- [ ] Siapkan checklist parity antara source `ecommercestarter` dan app Next baru.
- [ ] Bandingkan route per route dan endpoint per endpoint.
- [ ] Lakukan manual QA untuk:
- [ ] auth
- [ ] catalog
- [ ] variant select
- [ ] cart
- [ ] checkout
- [ ] voucher
- [ ] order placement
- [ ] payment upload
- [ ] admin review
- [ ] inventory adjustment
- [ ] settings update
- [ ] Jalankan build, lint, test, dan typecheck final.
- [ ] Tentukan kapan `ecommercestarter` boleh diarsipkan atau dihapus dari workspace aktif.
- [ ] Update dokumentasi run/deploy untuk codebase final.

## 26. Specific Known Fixes to Carry Into Migration

- [ ] Daftarkan dan selesaikan wiring auth middleware/session context.
- [ ] Selesaikan mismatch preview total vs final order total.
- [ ] Selesaikan mismatch payment status vs order status.
- [ ] Selesaikan product variant persistence bug.
- [ ] Selesaikan admin products page yang masih placeholder.
- [ ] Selesaikan broken nav links `/categories` dan `/profile`.
- [ ] Selesaikan seed default config yang belum terpakai.
- [ ] Selesaikan audit log schema design yang masih problematik.
- [ ] Selesaikan build root yang gagal karena source lama ikut ter-compile.
