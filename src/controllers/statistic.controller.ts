import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { sendSuccess } from '../utils/response';

// GET /api/statistics
export const getStatistics = async (_req: Request, res: Response) => {
  const [totalPlayers, totalHeroesOwned, diamondSum, ownedGroups, roleGroups] = await Promise.all([
    prisma.player.count(),
    prisma.playerHero.count(),
    prisma.player.aggregate({ _sum: { diamond: true } }),
    // hero yang paling banyak dimiliki (seri -> id hero terkecil)
    prisma.playerHero.groupBy({
      by: ['heroId'],
      _count: { heroId: true },
      orderBy: [{ _count: { heroId: 'desc' } }, { heroId: 'asc' }],
      take: 1,
    }),
    // jumlah hero per role (terbanyak dulu, seri -> urut nama role)
    prisma.hero.groupBy({
      by: ['role'],
      _count: { role: true },
      orderBy: [{ _count: { role: 'desc' } }, { role: 'asc' }],
    }),
  ]);

  let mostOwnedHero: { heroId: number; name: string; owners: number } | null = null;
  const top = ownedGroups[0];
  if (top) {
    const hero = await prisma.hero.findUnique({ where: { id: top.heroId } });
    if (hero) {
      mostOwnedHero = { heroId: hero.id, name: hero.name, owners: top._count.heroId };
    }
  }

  return sendSuccess(res, 200, 'Berhasil mengambil statistik', {
    totalPlayers,
    totalHeroesOwned,
    totalDiamond: diamondSum._sum.diamond ?? 0,
    mostOwnedHero,
    heroesPerRole: roleGroups.map((g) => ({ role: g.role, total: g._count.role })),
  });
};
