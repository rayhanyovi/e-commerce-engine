# Workflow Contract

Dokumen ini adalah kontrak kerja permanen untuk migrasi project ini. Kalau ada perubahan workflow, file ini harus diupdate supaya keputusan kerja tetap tertulis di repo.

## Core Agreement

- Kita sedang membangun app baru di root Next.js project.
- `ecommercestarter/` hanya dipakai sebagai reference sementara selama parity belum selesai.
- Setelah migrasi benar-benar beres, `ecommercestarter/` akan dihapus.
- Fokus utama bukan membagi kerja secara kaku menjadi `feature parity`, `bug fixes`, atau `architecture cleanup`.
- Anggap project ini sebagai rebuild baru dengan `ecommercestarter/` sebagai bahan referensi teknikal.

## Repo Workflow

- Tidak ada branch migrasi terpisah.
- Semua pekerjaan masuk langsung ke root workspace ini.
- Setiap task yang benar-benar selesai harus:
  - update checklist yang relevan di `to_dos.md`
  - diakhiri dengan commit terpisah untuk task itu
- Kalau task belum benar-benar selesai, jangan dicentang dan jangan dipaksa commit seolah sudah final.

## Scope Order

Urutan pengerjaan baseline:

1. Storefront
2. Admin
3. Auth
4. Inventory
5. Catalog
6. Cart
7. Checkout
8. Payments
9. Orders
10. Promotions
11. Settings
12. Audit

Catatan:

- Payments untuk tahap awal memakai mock.
- Integrasi provider nyata seperti Xendit dilakukan setelah flow inti stabil.

## Commit Convention

Format commit message:

`<tag>: <nama task>`

Aturan:

- Gunakan satu tag umum saja, misalnya `feat`, `fix`, `refactor`, `docs`, `chore`, `ui`, `style`.
- Jangan pakai format seperti `feat(ui)` atau tag bertingkat.
- Nama task ditulis natural seperti kalimat biasa, tidak perlu `-` atau `_`.

Contoh yang valid:

- `feat: Add storefront shell routes`
- `docs: Define migration workflow contract`
- `fix: Align root tsconfig with Next app scope`

## Tracking Rule

- `to_dos.md` adalah checklist kerja utama.
- `overview.md` adalah peta teknikal reference system.
- `workflow_contract.md` ini adalah aturan kerja dan keputusan kolaborasi.

## Operating Principle

- Lebih baik menyelesaikan potongan sistem yang utuh daripada memindahkan banyak file setengah jadi.
- URL final, server boundary, dan data contract harus distabilkan lebih dulu sebelum wiring detail.
- Jangan terlalu khawatir merawat `ecommercestarter/`; fungsinya hanya sebagai referensi sampai migrasi selesai.
