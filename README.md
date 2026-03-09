# E-Commerce Engine

Reusable full-stack ecommerce engine built with Next.js, Prisma, Zod, and the App Router.

Project ini diposisikan sebagai `commerce core` yang bisa dipakai ulang untuk banyak jenis toko. Tujuannya bukan membangun satu storefront yang hardcoded, tetapi menyiapkan engine yang reliable agar project berikutnya bisa fokus ke UI, branding, dan experience layer.

## Core Idea

Build the engine once, reuse it across many stores.

Yang seharusnya stabil:

- auth dan session
- catalog contracts
- inventory logic
- cart behavior
- checkout formula
- order lifecycle
- payment review flow
- promotions rules
- admin operations

Yang seharusnya berubah per client:

- visual identity
- layout
- marketing content
- product storytelling
- storefront composition

## Current Scope

Implemented and active:

- storefront shell
- admin dashboard and admin shell
- auth
- catalog
- inventory
- cart
- checkout
- manual payment review
- orders
- promotions
- settings
- audit
- addresses
- users admin registry
- product create/edit flow

Still open:

- storefront/admin E2E coverage
- `FREE_PRODUCT` promotion support
- final guest checkout decision
- audit log schema cleanup
- final legacy cutover and archive of `ecommercestarter/`

## Architecture

- `app/`
  Next.js App Router pages dan route handlers
- `src/server/`
  reusable business modules dan domain flows
- `src/shared/contracts/`
  shared Zod schemas, envelopes, dan error codes
- `src/lib/`
  client request helpers dan integration utilities
- `src/hooks/`
  hook client yang masih relevan untuk UI interaktif
- `prisma/`
  schema dan seed
- `ecommercestarter/`
  legacy reference sementara selama parity belum selesai

## Client State Strategy

- Baseline app ini tidak memakai React Query.
- Data-heavy view diutamakan server-driven lewat App Router dan server modules.
- Hook client dipertahankan hanya untuk mutation flow atau state UI lokal seperti cart dan session.

## API Guarantees

- Customer-owned API resources seperti orders, addresses, payment instructions, dan payment proof
  dijaga dengan user scoping di server layer, bukan hanya di client.
- API success dan API error memakai envelope yang konsisten lewat shared contracts.
- Proxy-level security rejection seperti invalid request origin juga mengembalikan JSON error
  envelope yang sama.
- Frontend dan backend berjalan same-origin di Next.js App Router, jadi tidak ada layer CORS
  terpisah yang perlu dipelihara di baseline ini.

## Working Model

Untuk project toko baru, pendekatan yang diinginkan adalah:

1. gunakan engine ini sebagai baseline
2. bangun UI dan branding baru
3. hubungkan UI ke contract, server modules, dan hooks yang sudah ada
4. ubah engine hanya jika ada kebutuhan bisnis yang benar-benar baru

Dengan model ini, effort berikutnya harus lebih banyak di layer UI daripada mengulang cart, checkout, orders, payments, dan admin logic dari nol.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm test
```

Database bootstrap for local development:

1. Copy `.env.local.example` to `.env.local`.

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

Prisma CLI sekarang ikut membaca `.env.local`, jadi migrasi, seed, dan generate tidak lagi butuh `set DATABASE_URL=...` manual.

Kalau di Windows muncul error `EPERM` saat `prisma generate` atau `prisma migrate`, stop dulu `npm run dev`, jalankan command Prisma, lalu start lagi dev server-nya.

Environment templates:

- `.env.example`: generic contract reference
- `.env.local.example`: local development defaults
- `.env.staging.example`: staging baseline with non-local URLs
- `.env.production.example`: production baseline with deployment placeholders

## Deploy Baseline

Recommended production or staging deployment sequence:

1. Copy the right environment template and set `DATABASE_URL`, `AUTH_SECRET`, and deployment URLs.
2. Install dependencies with `npm ci`.
3. Generate the Prisma client with `npm run db:generate`.
4. Apply database migrations with `npm run db:deploy`.
5. Build the app with `npm run build`.
6. Start the app with `npm run start`.

Recommended post-deploy smoke checks:

- open `/`
- open `/products`
- verify `/login` and `/register`
- verify `/admin` with an admin session
- check `/api/products`
- check `/api/admin/dashboard`

Notes:

- `npm run db:seed` is meant for local bootstrap or controlled non-production setup, not for blind production use.
- This baseline assumes same-origin deployment for storefront, admin, and API in the same Next.js app.

## Docker

Local Docker setup tersedia untuk app + Postgres.

```bash
docker compose up --build
```

Compose akan:

- build image app dari root project
- menjalankan PostgreSQL lokal
- menjalankan `prisma migrate deploy`
- menjalankan `prisma seed`
- start Next.js app di `http://localhost:3000`

Docker Compose ini diposisikan untuk local bootstrap dan quick verification, bukan sebagai production orchestrator final.

Kalau hanya mau build image-nya:

```bash
docker build -t ecommerce-engine:latest .
```

## Project Docs

- [overview.md](./overview.md): technical positioning, architecture, domain flows, and reuse model
- [parity_checklist.md](./parity_checklist.md): route and endpoint parity matrix against `ecommercestarter`
- [to_dos.md](./to_dos.md): migration and implementation backlog
- [workflow_contract.md](./workflow_contract.md): collaboration and commit rules

## Repo Rules

- Semua implementasi baru masuk ke root Next.js app.
- `ecommercestarter/` hanya dipakai sebagai reference sementara.
- Checklist implementasi utama dilacak di `to_dos.md`.
- Task yang selesai diakhiri dengan commit terpisah sesuai workflow contract.
