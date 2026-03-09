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

- [x] Tentukan stack target untuk data layer: Prisma tetap dipakai atau ada perubahan.
- [x] Tentukan auth stack: custom JWT cookie, Lucia/Auth.js, atau solusi internal lain.
- [ ] Tentukan apakah React Query masih dipakai di Next app atau hanya dipakai untuk bagian yang benar-benar client-heavy.
- [ ] Port atau regenerate komponen shadcn/ui agar kompatibel dengan Next + React 19.
- [ ] Rencanakan migrasi Tailwind 3 tokens ke Tailwind 4.
- [x] Tambahkan dependency yang benar-benar diperlukan untuk backend logic di app Next.
- [ ] Hindari membawa dependency source yang tidak terpakai.

## 3. Environment and Configuration

- [x] Definisikan `.env` contract untuk:
- [x] `DATABASE_URL`
- [x] `JWT_SECRET` atau auth secret baru
- [x] app base URL
- [x] upload storage config jika payment proof jadi real upload
- [ ] Tambahkan config per environment: local, staging, production.
- [x] Putuskan timezone default, currency default, dan base locale.

## 4. Database and Prisma

- [x] Port `schema.prisma` ke app Next.
- [ ] Review ulang semua model dan enum sebelum generate migration pertama.
- [x] Perbaiki desain `AuditLog` agar tidak hard-link generic `entityId` ke `Order.id`.
- [x] Review apakah `PromotionUsage` perlu relation yang lebih lengkap ke `Order` dan `User`.
- [x] Review apakah `PaymentProof.filePath` cukup, atau perlu metadata file yang lebih formal.
- [x] Jalankan Prisma migration yang benar di workspace baru.
- [x] Tambahkan script seed.
- [x] Implement seed untuk default `StoreConfig`.
- [x] Tambahkan sample seed data untuk categories, products, variants, dan admin user.

## 5. Shared Contracts and Validation

- [x] Pindahkan seluruh Zod schemas dari `packages/contracts` ke shared layer yang benar-benar dipakai app Next.
- [x] Pertahankan envelope response bila route handlers masih exposed ke client.
- [ ] Audit ulang schema yang belum terpakai konsisten.
- [ ] Tambahkan validation untuk endpoint yang saat ini belum memakai Zod pipe.
- [x] Pastikan type inference dari schema tetap menjadi source of truth.

## 6. Server Architecture in Next

- [x] Buat folder server layer, misalnya `src/server/`.
- [ ] Pisahkan module menjadi:
- [x] `auth`
- [x] `catalog`
- [x] `cart`
- [x] `checkout`
- [x] `orders`
- [x] `payments`
- [x] `promotions`
- [x] `inventory`
- [x] `settings`
- [x] `audit`
- [x] Port domain helpers:
- [x] `getEffectivePrice`
- [x] `isValidStatusTransition`
- [x] `calculateDiscount`
- [x] `isPromotionEligible`
- [x] `calculateShipping`
- [x] `checkStockAvailability`
- [x] Tambahkan error normalizer yang konsisten.
- [ ] Tambahkan request logging dan request ID di Next layer bila dibutuhkan.

## 7. Auth and Session

- [x] Implement register.
- [x] Implement login.
- [x] Implement logout.
- [x] Implement `me` session/profile fetch.
- [x] Pindahkan penyimpanan auth dari `localStorage` ke cookie/httpOnly atau session mechanism lain yang SSR-friendly.
- [x] Implement admin role guard untuk route admin dan server actions admin.
- [ ] Implement profile update endpoint/page bila memang dibutuhkan.
- [ ] Putuskan nasib guest cart dan guest checkout:
- [ ] jika guest checkout didukung, implement guest identity cookie end-to-end
- [ ] jika guest checkout tidak didukung, hapus misleading config dan flow

## 8. Catalog Domain

- [x] Port category list public.
- [x] Port admin category list.
- [x] Port category create/update/delete.
- [x] Port product public listing dengan pagination, search, category filter, sort, price filter.
- [x] Port product detail by slug.
- [x] Port admin product list penuh.
- [ ] Port admin product create.
- [ ] Port admin product edit.
- [ ] Port admin product delete.
- [ ] Port variant create/update/delete.
- [ ] Perbaiki logic persistence option definitions dan variant combinations.
- [ ] Ganti implementasi yang salah dari `variantOptionValue` ke model yang benar sesuai Prisma.
- [ ] Tambahkan validasi uniqueness slug dan SKU secara konsisten.

## 9. Cart Domain

- [x] Port active cart lookup.
- [x] Port guest cart identity handling bila dibutuhkan.
- [x] Port add item.
- [x] Port update qty.
- [x] Port remove item.
- [x] Port clear cart.
- [x] Tambahkan validasi stok dan availability saat add/update cart.
- [x] Tentukan apakah cart disimpan via API handlers, server actions, atau hybrid.

## 10. Checkout Domain

- [x] Port checkout preview.
- [x] Samakan formula preview dengan formula final place order.
- [x] Gunakan `StoreConfig` untuk shipping cost, ETA, free shipping threshold, max vouchers, stacking rules.
- [x] Implement voucher validation yang sama antara preview dan order finalization.
- [x] Pastikan shipping address bisa berasal dari saved address atau inline form.
- [x] Implement idempotency key handling di Next server layer.
- [ ] Putuskan apakah checkout harus login atau boleh guest.
- [ ] Pastikan `ALLOW_GUEST_CHECKOUT` benar-benar dipakai atau dihapus.

## 11. Orders Domain

- [x] Port place order.
- [x] Port my orders list.
- [x] Port my order detail.
- [x] Port admin order list.
- [x] Port admin order detail.
- [x] Port admin update order status.
- [x] Pastikan order menyimpan:
- [x] `productDiscountTotal`
- [x] `voucherDiscountTotal`
- [x] `shippingMethod`
- [x] `shippingEtaDays`
- [x] `customerSnapshot`
- [x] `addressSnapshot`
- [x] Perbaiki `variantLabelSnapshot` agar memakai label variant yang benar, bukan fallback ID sembarang.
- [x] Pastikan stock reservation dibuat saat order diletakkan.
- [x] Pastikan reservation release/consume konsisten terhadap perubahan status.

## 12. Payments Domain

- [x] Port payment instructions.
- [x] Batasi akses payment instructions ke owner order atau admin bila memang harus private.
- [x] Port upload payment proof.
- [x] Putuskan apakah payment proof akan tetap berupa manual URL/path atau pakai upload file sungguhan.
- [ ] Bila pakai upload nyata, tambahkan storage provider dan signed upload flow.
- [x] Port admin payment review queue.
- [x] Port confirm payment.
- [x] Port reject payment.
- [x] Satukan state machine order-payment:
- [x] upload proof harus bisa menggeser order ke `PAYMENT_REVIEW`
- [x] confirm payment harus bisa menggeser order ke `PAID`
- [x] reject payment harus bisa mengembalikan order ke status yang tepat

## 13. Promotions Domain

- [x] Port promotion list admin.
- [x] Port create promotion.
- [x] Port update promotion.
- [x] Port delete promotion.
- [x] Port voucher validation.
- [x] Perbaiki update promotion agar `scopes` ikut tersinkron.
- [x] Implement `PromotionUsage` creation saat order sukses.
- [x] Increment `Promotion.totalUsed` saat voucher benar-benar dipakai.
- [x] Pastikan per-user limit dan total usage limit benar-benar enforceable.
- [ ] Putuskan support `FREE_PRODUCT`; saat ini logic diskonnya belum benar-benar ada.
- [x] Pastikan stacking rule dan `MAX_VOUCHERS_PER_ORDER` dijalankan konsisten.

## 14. Inventory Domain

- [x] Port manual stock adjustment.
- [x] Port stock movement list.
- [x] Port low stock list.
- [x] Pastikan stock movement tercatat juga untuk reserve, consume, dan release order.
- [x] Tambahkan guard supaya stock tidak pernah negatif.
- [ ] Tambahkan referensi `actorId` dan `referenceId` secara konsisten.

## 15. Addresses Domain

- [x] Port my addresses list.
- [x] Port create address.
- [x] Port update address.
- [x] Port delete address.
- [x] Pertahankan logic default address.
- [x] Tambahkan address selection di checkout yang konsisten dengan saved/new flow.

## 16. Store Config and Settings

- [x] Port admin settings list.
- [x] Port admin settings bulk update.
- [x] Tambahkan initialization path untuk default configs.
- [ ] Pastikan semua config key yang ada benar-benar dipakai business logic.
- [ ] Hapus config yang tidak lagi relevan setelah auth/checkout decision final.

## 17. Dashboard and Audit

- [x] Port admin dashboard summary.
- [x] Port audit log list.
- [x] Putuskan desain audit log final:
- [x] generic polymorphic log
- [ ] atau audit per entity type
- [x] Pastikan audit record dibuat untuk order, payment, promotion, inventory, dan settings changes yang penting.

## 18. Storefront Pages

- [x] Buat storefront layout Next.
- [x] Migrasikan homepage.
- [x] Migrasikan products list page.
- [x] Migrasikan product detail page.
- [x] Migrasikan cart page.
- [x] Migrasikan checkout page.
- [x] Migrasikan orders page.
- [x] Migrasikan addresses page.
- [x] Migrasikan login page.
- [x] Migrasikan register page.
- [ ] Putuskan apakah `/categories` akan dibuat atau link-nya dihapus.
- [ ] Putuskan apakah `/profile` akan dibuat atau link-nya dihapus.
- [ ] Ganti penggunaan `<img>` external ke strategi `next/image` atau pertahankan `<img>` dengan alasan yang jelas.

## 19. Admin Pages

- [x] Buat admin layout Next.
- [x] Migrasikan dashboard.
- [ ] Migrasikan categories page.
- [x] Implementasikan products list yang belum jadi di source app.
- [ ] Migrasikan product create page.
- [ ] Implementasikan product edit page sungguhan.
- [x] Migrasikan orders page.
- [x] Migrasikan promotions page.
- [x] Migrasikan payments page.
- [ ] Migrasikan users page.
- [x] Migrasikan inventory page.
- [x] Migrasikan audit page.
- [x] Migrasikan settings page.

## 20. Client State and Hooks Re-Design

- [ ] Audit hook mana yang tetap relevan di Next app.
- [ ] Ubah hook data-heavy menjadi server-driven bila memungkinkan.
- [ ] Simpan hook client-only untuk form/dialog/local UI state.
- [ ] Buat wrapper auth/session hook yang SSR-safe.
- [x] Buat cart hook baru yang tidak hard-coded pada `localStorage` saat render server.
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
- [x] Tambahkan halaman error dan not-found yang proper di App Router.
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
- [x] Selesaikan mismatch preview total vs final order total.
- [x] Selesaikan mismatch payment status vs order status.
- [ ] Selesaikan product variant persistence bug.
- [ ] Selesaikan admin products page yang masih placeholder.
- [ ] Selesaikan broken nav links `/categories` dan `/profile`.
- [ ] Selesaikan seed default config yang belum terpakai.
- [ ] Selesaikan audit log schema design yang masih problematik.
- [ ] Selesaikan build root yang gagal karena source lama ikut ter-compile.
