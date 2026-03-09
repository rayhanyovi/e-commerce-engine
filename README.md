# E-Commerce Engine

Root project ini adalah target migrasi Next.js fullstack untuk source app yang sekarang masih ada di `ecommercestarter/`.

## Current State

- App utama di root memakai Next.js App Router.
- Source referensi lama masih disimpan di `ecommercestarter/`.
- Audit teknikal ada di `overview.md`.
- Backlog migrasi ada di `to_dos.md`.

## Target Structure

- `app/`: route tree App Router.
- `src/`: shared code baru untuk server, contracts, config, dan reusable modules.
- `ecommercestarter/`: source reference lama selama proses migrasi.

## Scripts

```bash
npm run dev
npm run build
npm run lint
```

## Working Rules

- Jangan implement fitur baru langsung di `ecommercestarter/` kecuali memang sedang melakukan audit/perbandingan.
- Semua migrasi baru masuk ke root Next.js app.
- Checklist status implementasi harus diupdate di `to_dos.md`.
