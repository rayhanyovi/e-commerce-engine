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

Sudah tersedia atau baseline-ready:

- storefront shell
- admin shell
- auth
- catalog
- inventory
- cart
- checkout
- manual payment review
- orders
- promotions

Masih pending atau partial:

- settings
- audit
- addresses
- admin dashboard
- users admin
- product create/edit/variant management
- `FREE_PRODUCT` promotion support

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
npm run lint
```

## Docker

Local Docker setup sekarang tersedia untuk app + Postgres.

```bash
docker compose up --build
```

Compose akan:

- build image app dari root project
- menjalankan PostgreSQL lokal
- menjalankan `prisma db push`
- menjalankan `prisma seed`
- start Next.js app di `http://localhost:3000`

Kalau hanya mau build image-nya:

```bash
docker build -t ecommerce-engine:latest .
```

## Project Docs

- [overview.md](./overview.md): technical positioning, architecture, domain flows, and reuse model
- [to_dos.md](./to_dos.md): migration and implementation backlog
- [workflow_contract.md](./workflow_contract.md): collaboration and commit rules

## Repo Rules

- Semua implementasi baru masuk ke root Next.js app.
- `ecommercestarter/` hanya dipakai sebagai reference sementara.
- Checklist implementasi utama dilacak di `to_dos.md`.
- Task yang selesai diakhiri dengan commit terpisah sesuai workflow contract.
