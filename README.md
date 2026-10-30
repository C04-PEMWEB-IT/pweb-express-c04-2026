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

## Install manual dari nol (urutan yang dipakai)

```bash
npm install express@5 dotenv @prisma/client@7 @prisma/adapter-neon@7
npm install -D typescript tsx prisma@7 @types/node @types/express@5
```

## Environment variable

| Variabel | Fungsi |
| --- | --- |
| `DATABASE_URL` | Pooled connection Neon (ada `-pooler`), dipakai aplikasi lewat adapter |
| `DIRECT_URL` | Direct connection Neon, dipakai Prisma CLI (`prisma.config.ts`) |
| `PORT` | Port server (default 3000) |

`.env` tidak di-commit. Contoh ada di `.env.example`.

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

## Pembagian tugas kelompok

| Anggota | Bagian |
| --- | --- |
| Anggota 1 | Setup project, Neon, schema, seed, `/health`, middleware (Fitur 1), Top Up & Match (Fitur 5), Statistik (Fitur 7) |
| Anggota 2 | Hero (Fitur 2), Skin (Fitur 3) |
| Anggota 3 | Player CRUD (Fitur 4), Beli Hero (Fitur 6) |
