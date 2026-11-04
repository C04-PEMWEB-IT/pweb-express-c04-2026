# MLBB Shop API - Praktikum Pemrograman Web Modul 4

Backend Express untuk toko versi sederhana Mobile Legends (Diamond, Battle Point, hero, skin) buatan HMIT ITS.

**Tech stack:** Express 5 + TypeScript, Prisma ORM 7, PostgreSQL di Neon (`@prisma/adapter-neon`).

## Cara menjalankan

Syarat: Node.js 20.19+ (kebutuhan Prisma 7).

```bash
# 1. install dependency
npm install

# 2. siapkan .env (isi dari Neon Console -> Connect)
cp .env.example .env

# 3. generate Prisma Client + migrasi database
npx prisma generate
npx prisma migrate dev --name init

# 4. seed data (133 hero, 892 skin, 3 player)
npx tsx prisma/seed.ts

# 5. jalankan server
npm run dev
```

Cek `http://localhost:3000/health`. Seed ulang sebelum demo / sebelum menjalankan testcase.

## Persiapan sebelum testing

Lakukan langkah berikut **sebelum** menjalankan testcase. Urutannya penting karena testcase memakai data hasil seed dan saling bergantung.

| Kebutuhan | Keterangan |
| --- | --- |
| Node.js | 20.19+ (`node -v`) |
| Dependency | Sudah `npm install` |
| Database | PostgreSQL di Neon, sudah dibuat |
| File `.env` | Disalin dari `.env.example` dan diisi (lihat tabel Environment variable) |
| Prisma Client | Sudah `npx prisma generate` |
| Tabel database | Sudah dimigrasi (`npx prisma migrate deploy`, atau `npx prisma migrate dev --name init` untuk pertama kali) |
| Data awal | Sudah `npm run seed` |
| Tools testing | Postman / Insomnia / Newman |
| Server | Sudah `npm run dev` dan `/health` mengembalikan 200 |

Checklist persiapan:

1. `npm install`
2. Siapkan `.env` di root project (tidak di-commit, tetapi terdapat contohnya pada `.env.example`):
   ```env
   DATABASE_URL="postgresql://...-pooler...neon.tech/neondb?sslmode=require"
   DATABASE_URL_UNPOOLED="postgresql://...neon.tech/neondb?sslmode=require"
   PORT=3000
   ```
3. `npx prisma generate`
4. `npx prisma migrate deploy` (database baru: `npx prisma migrate dev --name init`)
5. `npm run seed` — **jalankan tepat sebelum testing / demo**
6. Verifikasi data seed lewat `npx prisma studio` atau `GET /api/statistics`:
   - Hero: 133 (id 1 = Miya, id 133 = Hirara)
   - Skin: 892
   - Player: 3 (ArekITS, SangPushRank, MageSurabaya)
   - PlayerHero: 4
7. `npm run dev`, lalu cek `http://localhost:3000/health` → 200
8. Import `mlbb-shop-testcase.postman_collection.json` ke Postman, lalu **Run** collection dari nomor 1 sampai 28 sesuai urutan

> **Penting:** testcase bersifat berurutan dan saling bergantung (misalnya testcase #7 dan #13 mengharapkan data dari #6 dan #12). Jangan melompat atau mengacak urutan. Jika ingin mengulang dari awal, jalankan `npm run seed` lagi. Collection ini tidak punya assertion otomatis, jadi status code dan isi response dicek manual.

### File testcase

Semua testcase ada di [`mlbb-shop-testcase.postman_collection.json`](./mlbb-shop-testcase.postman_collection.json). File ini berisi 28 request yang harus dijalankan berurutan dari nomor 1 sampai 28; nama tiap request menjelaskan skenario dan hasil yang diharapkan (misalnya `07. Tambah Hero Nama Sudah Ada` diharapkan menghasilkan 409).

## Environment variable

| Variabel | Fungsi |
| --- | --- |
| `DATABASE_URL` | Pooled connection Neon (ada `-pooler`), dipakai aplikasi lewat adapter |
| `DATABASE_URL_UNPOOLED` | Direct connection Neon, dipakai Prisma CLI (`prisma.config.ts`) |
| `PORT` | Port server (default 3000) |

`.env` tidak di-commit kedalam repositori ini. Contoh ada di `.env.example`.

## Endpoint

| Fitur | Metode | Endpoint |
| --- | --- | --- |
| - | GET | `/health` |
| Hero | GET | `/api/heroes` (`page`, `limit`, `search`, `role`) |
| Hero | GET | `/api/heroes/:hero_id` |
| Hero | POST | `/api/heroes` |
| Skin | GET | `/api/skins` (`page`, `limit`, `heroId`, `rarity`) |
| Skin | GET | `/api/skins/:skin_id` |
| Player | POST | `/api/players` |
| Player | GET | `/api/players/:player_id` |
| Player | PATCH | `/api/players/:player_id` |
| Player | DELETE | `/api/players/:player_id` |
| Top Up & Match | POST | `/api/players/:player_id/topup` |
| Top Up & Match | POST | `/api/players/:player_id/matches` |
| Beli Hero | POST | `/api/players/:player_id/heroes` |
| Statistik | GET | `/api/statistics` |

Format response sukses `{ status: true, message, data, metadata? }`, gagal `{ status: false, message }`.

## Struktur folder

```
prisma/            schema.prisma, seed.ts, migrations/
data/              heroes.json, skins.json
src/
  app.ts, index.ts
  lib/prisma.ts    Prisma Client + adapter Neon
  middlewares/     logger, notFound, errorHandler
  utils/           HttpError, response, validators
  controllers/     hero, skin, player, purchase, transaction, statistic
  routes/          satu file per fitur + index.ts
```
