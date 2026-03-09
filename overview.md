# E-Commerce Engine Overview

## Positioning

Project ini bukan ditujukan sebagai satu website toko yang statis. Arah utamanya adalah membangun `reusable ecommerce engine` berbasis Next.js fullstack yang bisa dipakai ulang untuk berbagai jenis toko:

- toko kue
- toko sepatu
- toko fashion
- toko furniture
- toko lain dengan kebutuhan commerce yang mirip

Ide utamanya sederhana:

- engine dibangun sekali
- business logic distabilkan sekali
- kontrak data dan flow operasional dijaga tetap konsisten
- UI per client tinggal menjadi lapisan presentasi di atas engine itu

Karena itu, aset utama project ini bukan hanya kumpulan function dan hook. Yang lebih penting adalah kombinasi dari:

- data model
- validation contract
- server modules
- state machine order/payment
- admin operations
- client integration layer yang tipis dan konsisten

`ecommercestarter/` saat ini hanya dipakai sebagai reference system sampai parity selesai, lalu akan dihapus.

## Product Thesis

Cara memandang project ini:

- ini adalah `commerce core`
- setiap toko baru seharusnya cukup mengganti UI, branding, copy, media, dan kadang sedikit aturan bisnis
- flow inti seperti auth, catalog, cart, checkout, order, payment review, promotion, dan inventory tidak boleh ditulis ulang dari nol setiap ada client baru

Target akhirnya bukan "satu storefront jadi", tetapi:

1. punya engine ecommerce yang reliable
2. punya admin ops yang stabil
3. punya contract yang enak dikonsumsi UI
4. bisa membuat storefront baru dengan effort yang dominan di layer UI

## Current Shape

### Repo map

| Path | Role |
| --- | --- |
| `app/` | Next.js App Router pages dan route handlers |
| `src/server/` | Server modules, domain logic, dan business flow |
| `src/shared/contracts/` | Shared Zod contracts, error codes, envelope response |
| `src/lib/` | Client request helpers, formatters, utility integration layer |
| `src/hooks/` | Hook client yang masih relevan untuk UI interaktif |
| `src/components/` | Presentational dan interactive components |
| `prisma/` | Schema dan seed data |
| `ecommercestarter/` | Legacy reference sementara |

### Engine layers

#### 1. Presentation layer

Di `app/` dan `src/components/`.

Tugas layer ini:

- menampilkan storefront
- menampilkan admin workspace
- menghubungkan form/button/filter ke contract yang sudah ada

Layer ini seharusnya yang paling banyak berubah dari satu client ke client lain.

#### 2. Engine layer

Di `src/server/`.

Ini adalah inti reusable system. Di sini berada:

- auth
- catalog
- inventory
- cart
- checkout
- orders
- payments
- promotions
- store config

Layer ini seharusnya stabil dan tidak ikut berubah hanya karena UI client berbeda.

#### 3. Contract layer

Di `src/shared/contracts/`.

Perannya:

- menjaga request/response shape tetap konsisten
- memastikan validation berada di satu boundary
- membuat UI, route handlers, dan server modules bicara dengan schema yang sama

#### 4. Data layer

Di Prisma schema dan database.

Perannya:

- menyimpan entitas commerce
- menjaga relasi domain
- menjadi fondasi untuk order state, promotion usage, inventory movement, dan payment proof

#### 5. Client integration layer

Di `src/lib/*/client.ts` dan sebagian hook di `src/hooks/`.

Ini adalah lapisan tipis yang menghubungkan UI ke engine:

- fetch helper
- mutation helper
- cart hook
- payment review request
- promotion CRUD request

Prinsipnya: jangan duplikasi business logic di hook. Hook cukup menjadi consumer dari engine.

## Current Domain Coverage

### Implemented now

| Domain | Status | Notes |
| --- | --- | --- |
| Auth | Implemented | Cookie/httpOnly session, login, register, logout, `me`, admin guard |
| Catalog | Implemented baseline | Public list/detail, admin list, category CRUD sudah ada |
| Inventory | Implemented baseline | Manual adjustment, movement list, low stock, reserve/consume/release tercatat |
| Cart | Implemented | Guest cart token, add/update/remove/clear, merge ke user saat auth |
| Checkout | Implemented baseline | Preview, voucher validation, shipping calc, idempotency, inline address |
| Payments | Implemented baseline | Manual transfer mock, instructions, proof upload, admin review queue |
| Orders | Implemented baseline | Place order, my orders, admin orders, reservation flow, payment sync |
| Promotions | Implemented baseline | Admin CRUD, voucher validation, scope sync, usage tracking |

### Still pending or partial

| Domain | Status | Notes |
| --- | --- | --- |
| Settings | Pending | Admin settings page dan bulk update belum selesai |
| Audit | Pending | Audit list page belum selesai walau audit record sebagian sudah dibuat |
| Addresses | Partial | Saved address flow belum dimigrasikan penuh |
| Admin dashboard | Pending | Summary dashboard belum dimigrasikan |
| Users admin | Pending | User list/admin management belum dimigrasikan |
| Product create/edit | Partial | Catalog list sudah ada, create/edit/variant management belum selesai |
| `FREE_PRODUCT` promotions | Pending | Masih tercatat sebagai gap logic |

## Current Route Surface

### Storefront routes

- `/`
- `/products`
- `/products/[slug]`
- `/cart`
- `/checkout`
- `/orders`
- `/orders/[orderId]`
- `/login`
- `/register`

### Admin routes

- `/admin`
- `/admin/catalog`
- `/admin/inventory`
- `/admin/orders`
- `/admin/orders/[orderId]`
- `/admin/payments`
- `/admin/promotions`
- `/admin/settings`
- `/admin/audit`

### API boundaries already active

- auth routes
- catalog routes
- cart routes
- checkout preview
- orders routes
- payment instructions/proof/review routes
- promotion CRUD and voucher validation routes
- inventory routes

## Core Engine Modules

### Auth

Current responsibilities:

- register
- login
- logout
- resolve current session
- admin authorization

Why it matters for reuse:

- UI toko manapun tetap butuh auth boundary yang sama
- admin pages harus memakai server guard yang sama
- session storage yang SSR-friendly lebih reusable daripada bearer token di localStorage

### Catalog

Current responsibilities:

- categories
- product listing
- product detail
- admin catalog visibility

Reusable value:

- kebanyakan toko tetap punya konsep category, product, variant, price, stock
- perbedaan antar client biasanya lebih ke presentasi produk, bukan contract data dasarnya

### Inventory

Current responsibilities:

- stock adjustment
- low stock monitoring
- stock movement log
- reservation consume/release tracking

Reusable value:

- inventory adalah domain operasional, bukan domain visual
- ini justru tipe logic yang harus dibangun sekali dan dipakai berulang

### Cart

Current responsibilities:

- active cart lookup
- guest identity handling
- add/update/remove/clear item
- validate stock and product activity

Reusable value:

- hampir semua toko butuh pola cart yang sama
- UI boleh berbeda, tetapi perilaku cart tidak boleh acak per project

### Checkout

Current responsibilities:

- preview total
- voucher application
- shipping calculation
- idempotency
- bridge ke order placement

Reusable value:

- formula checkout harus jadi source of truth lintas UI
- jangan sampai tiap storefront punya hitung total sendiri

### Orders

Current responsibilities:

- place order
- snapshot order item/address/customer
- reserve stock
- sync payment state
- my orders
- admin orders

Reusable value:

- order lifecycle adalah jantung engine
- ini bukan sesuatu yang seharusnya dirombak ulang untuk setiap client

### Payments

Current responsibilities:

- payment instructions
- payment proof upload
- admin review queue
- confirm/reject manual transfer
- sync payment status ke order status

Reusable value:

- saat ini mock/manual transfer dulu
- nanti provider seperti Xendit bisa masuk sebagai adapter di atas contract yang sudah stabil

### Promotions

Current responsibilities:

- promotion CRUD
- scope targeting
- voucher validation
- usage tracking
- stacking/max voucher rules

Reusable value:

- promo adalah domain rules
- UI hanya perlu form dan display
- rules eligibility harus tetap satu sumber kebenaran

## Business Flows That Define The Engine

### 1. Browse to cart

1. customer membuka product listing
2. customer memilih variant di product detail
3. item ditambahkan ke active cart
4. engine memvalidasi product/variant aktif dan stok tersedia

### 2. Checkout preview

1. checkout membaca active cart
2. engine menghitung subtotal
3. engine menghitung product discount
4. engine memvalidasi voucher
5. engine menghitung shipping
6. engine mengembalikan grand total final preview

### 3. Place order

1. UI mengirim checkout intent dengan idempotency key
2. engine membangun quote final dengan formula yang sama seperti preview
3. engine membuat order dan order items
4. engine membuat stock reservation
5. engine membuat payment record
6. engine menandai cart sebagai converted

### 4. Payment review

1. customer membuka payment instructions
2. customer upload payment proof
3. order bergeser ke `PAYMENT_REVIEW`
4. admin mereview proof
5. confirm akan menggeser order ke `PAID`
6. reject akan mengembalikan order ke status yang tepat

### 5. Promotion usage

1. voucher divalidasi terhadap scope dan rules store
2. order sukses membuat `PromotionUsage`
3. `Promotion.totalUsed` ikut bertambah
4. limit per-user dan total usage tetap bisa dienforce

Flow-flow ini adalah inti dari engine. Selama flow ini stabil, UI baru bisa dibangun jauh lebih cepat.

## Functions, Hooks, And How To Think About Them

Kalau memakai sudut pandang "functions dan hooks sudah siap", itu benar, tetapi perlu framing yang tepat.

Yang sebaiknya dianggap sebagai source of truth:

- server modules
- domain helpers
- shared contracts
- persistence model
- route/API boundaries

Yang sebaiknya dianggap sebagai adapter UI:

- client request helpers
- hooks
- form state handlers
- page components

Contoh adapter UI yang sekarang sudah ada:

- `src/hooks/use-cart.ts`
- `src/lib/checkout/client.ts`
- `src/lib/orders/client.ts`
- `src/lib/payments/client.ts`
- `src/lib/promotions/client.ts`

Artinya:

- kita memang sedang menyiapkan function dan hook untuk dipakai UI
- tetapi kita tidak boleh menganggap hook sebagai inti engine
- inti engine tetap ada di layer server, contract, dan state model

## What Should Stay Stable Across Client Projects

- Prisma schema dan entitas inti commerce
- Zod contracts
- auth/session model
- cart behavior
- checkout formula
- order placement flow
- payment review state machine
- promotion eligibility logic
- inventory reservation/movement
- admin operational modules

Kalau bagian-bagian ini stabil, kita tidak perlu membangun ulang backend commerce setiap datang project baru.

## What Should Change Per Client

- brand identity
- color system
- typography
- layout
- homepage composition
- category landing pages
- product storytelling
- marketing sections
- copywriting
- media asset
- kadang checkout UX detail

Dengan kata lain:

- engine tetap
- theme dan presentation berubah

## Practical Reuse Model

Kalau nanti ada project toko baru, pendekatan idealnya:

1. clone engine ini sebagai baseline
2. tentukan visual system dan brand layer
3. buat storefront pages yang sesuai brand
4. sambungkan UI ke server modules / client adapters yang sudah tersedia
5. ubah engine hanya jika memang ada aturan bisnis baru yang nyata

Bukan pendekatan ideal:

1. bikin project baru dari nol
2. rewrite cart
3. rewrite checkout
4. rewrite order flow
5. rewrite payment review

Itu akan menghabiskan waktu di tempat yang salah.

## Current Technical Risks And Open Gaps

Yang masih perlu dibereskan agar engine ini benar-benar matang:

- admin settings
- admin audit
- addresses flow penuh
- admin dashboard
- users admin page
- product create/edit/variant flow
- keputusan final soal guest checkout
- support `FREE_PRODUCT`
- testing yang bernilai
- removal final terhadap `ecommercestarter/`

Jadi project ini sudah cukup jelas sebagai engine, tetapi belum final-complete.

## Recommended Mental Model

Kalimat paling ringkas untuk memandang project ini:

> bangun commerce engine sekali, lalu pakai berulang untuk banyak storefront dengan fokus ulang di UI dan brand layer

Kalau mental model ini dijaga, keputusan arsitektur berikutnya akan lebih konsisten:

- business logic masuk engine
- UI tidak mengulang logic
- contract jadi boundary utama
- per-client work fokus ke presentation dan kebutuhan khusus
