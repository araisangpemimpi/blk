# BLKK Darul Maarif Bangsal Mojokerto — Landing Page + Backend Kustomisasi

Landing page mobile-first untuk `blk.darulmaarif.org` (BLKK Darul Maarif Bangsal Mojokerto — sesuai nama NPWP).

## Stack

- **Nuxt 4** + Vue 3
- **Nuxt UI 4** + TailwindCSS v4
- **Nuxt Content 3** — konten default dari `content/landing.yml`
- **Backend kustomisasi** — Nitro server API + file `data/landing.json` + upload `public/uploads` (tanpa database)

## Program (4 — resmi Kemnaker)

1. **Junior Web Developer** — https://proglat.kemnaker.go.id/programs/c46f312f-8ded-465c-ab3c-d9809b6a2506/versions/2
2. **Practical Office** — https://proglat.kemnaker.go.id/programs/9ab09d6a-d11e-4538-b166-bec232582074/versions/3
3. **Desainer Grafis Muda** — https://proglat.kemnaker.go.id/programs/e948a3ee-d85e-4bf7-90ed-c1a04f2411c0/versions/1
4. **Pembuatan Konten untuk Social Media** — https://proglat.kemnaker.go.id/programs/43af9ff0-4931-4129-a89d-20f1214cd8a7/versions/1

Tiap kartu program ada tombol **“Lihat Kurikulum Resmi Kemnaker”**.

## Jalankan

```bash
npm install
npm run dev
```

- Landing: http://localhost:3000
- Admin: http://localhost:3000/admin (password default `admin123`)

## Backend /admin

Halaman `/admin` (mobile-first) untuk non-teknisi:

- Tab **Situs & Kontak**: nama, WA, telepon, email, alamat, maps, jam
- Tab **Hero**: badge, judul, subjudul
- Tab **Program**: tambah/hapus/edit 4 program + link Proglat
- Tab **Galeri**: tambah/hapus foto, upload langsung (maks 4MB, tersimpan di `public/uploads`), atau tempel URL
- Tab **Warna & Mode**: palet warna utama (Hijau/Toska/Biru/Ungu + pratinjau langsung), mode awal pengunjung, tombol gelap-terang
- Tab **Lainnya**: marquee, CTA, judul testimoni/FAQ

API:

```
GET  /api/landing              → landing efektif (override JSON menang atas landing.yml)
POST /api/admin/login          → { password } → { token }
GET  /api/admin/landing        → butuh Bearer token
PUT  /api/admin/landing        → simpan override ke data/landing.json
POST /api/admin/reset          → hapus override, kembali ke landing.yml
POST /api/admin/upload         → multipart field `file` → { url: /uploads/... }
```

Auth: token = SHA256(`blk-admin:{password}:{secret}`), dikirim via `Authorization: Bearer`.

Env:

```bash
ADMIN_PASSWORD=admin123
ADMIN_TOKEN_SECRET=ganti-di-production
```

## Ubah Isi Tanpa Admin UI

Edit `content/landing.yml` (default). Jika sudah ada `data/landing.json` (dari /admin), hapus file itu atau klik **Reset** agar default dipakai lagi.

## Deploy

```bash
npm run build
```

> Catatan: karena kustomisasi disimpan di file `data/landing.json` di server, gunakan `npm run build` + `node .output/server/index.mjs` (Node preset) agar /admin bisa menyimpan. Mode `generate` statis hanya cocok untuk konten default.
