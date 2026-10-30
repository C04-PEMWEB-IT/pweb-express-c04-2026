import fs from 'node:fs';
import path from 'node:path';
import { prisma } from '../src/lib/prisma';
import type { Role, Lane, Rarity, Currency } from '../src/generated/prisma';

interface HeroJson {
  name: string;
  primaryRole: string;
  primaryLane: string;
  releaseYear: number;
  priceBP: number | null;
  priceDiamond: number | null;
}

interface SkinJson {
  name: string;
  heroId: number;
  rarity: string;
  priceDiamond: number | null;
}

const readJson = <T>(file: string): T =>
  JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', file), 'utf-8')) as T;

async function main() {
  const heroes = readJson<HeroJson[]>('heroes.json');
  const skins = readJson<SkinJson[]>('skins.json');

  // 1. Kosongkan semua tabel + reset id ke 1
  await prisma.$executeRawUnsafe(
    'TRUNCATE "PlayerHero", "Player", "Skin", "Hero" RESTART IDENTITY CASCADE',
  );
  console.log('Tabel dikosongkan');

  // 2. Hero (id otomatis: Miya = 1 ... Hirara = 133, sesuai urutan file)
  await prisma.hero.createMany({
    data: heroes.map((h) => ({
      name: h.name,
      role: h.primaryRole as Role,
      lane: h.primaryLane as Lane,
      releaseYear: h.releaseYear,
      priceBP: h.priceBP,
      priceDiamond: h.priceDiamond,
    })),
  });
  console.log(`Hero dimasukkan: ${heroes.length}`);

  // 3. Skin
  await prisma.skin.createMany({
    data: skins.map((s) => ({
      name: s.name,
      heroId: s.heroId,
      rarity: s.rarity as Rarity,
      priceDiamond: s.priceDiamond,
    })),
  });
  console.log(`Skin dimasukkan: ${skins.length}`);

  // 4. Player (dibuat berurutan supaya id = 1, 2, 3 dan sequence ikut maju)
  const players = [
    { nickname: 'ArekITS', bp: 1500, diamond: 75 },
    { nickname: 'SangPushRank', bp: 13000, diamond: 2892 },
    { nickname: 'MageSurabaya', bp: 10000, diamond: 0 },
  ];
  for (const p of players) {
    await prisma.player.create({ data: p });
  }
  console.log(`Player dimasukkan: ${players.length}`);

  // 5. PlayerHero
  const playerHeroes: { playerId: number; heroId: number; currency: Currency; pricePaid: number }[] = [
    { playerId: 1, heroId: 18, currency: 'BP', pricePaid: 2000 }, // Layla
    { playerId: 1, heroId: 1, currency: 'BP', pricePaid: 10800 }, // Miya
    { playerId: 2, heroId: 84, currency: 'DIAMOND', pricePaid: 599 }, // Ling
    { playerId: 2, heroId: 56, currency: 'BP', pricePaid: 32000 }, // Gusion
  ];
  await prisma.playerHero.createMany({ data: playerHeroes });
  console.log(`PlayerHero dimasukkan: ${playerHeroes.length}`);

  const [h, s, p] = await Promise.all([prisma.hero.count(), prisma.skin.count(), prisma.player.count()]);
  console.log(`Selesai seed -> hero: ${h}, skin: ${s}, player: ${p}`);
}

main()
  .catch((err) => {
    console.error('Seed gagal:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
