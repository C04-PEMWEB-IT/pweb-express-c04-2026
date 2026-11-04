import type { Request, Response } from 'express';
import { Currency } from '../generated/prisma';
import { prisma } from '../lib/prisma';
import { HttpError } from '../utils/httpError';
import { sendSuccess } from '../utils/response';
import { isBlank, isEnumValue, parseId } from '../utils/validators';

// POST /api/players/:player_id/heroes   body: { heroId, currency: "BP" | "DIAMOND" }
export const buyHero = async (req: Request, res: Response) => {
  const playerId = parseId(req.params.player_id, 'player_id');
  const { heroId, currency } = req.body ?? {};

  // 1. heroId wajib diisi dan currency harus BP/DIAMOND
  if (isBlank(heroId)) {
    throw new HttpError(400, 'heroId wajib diisi');
  }

  const heroIdNumber =
    typeof heroId === 'number'
      ? heroId
      : typeof heroId === 'string' && /^\d+$/.test(heroId.trim())
        ? Number(heroId.trim())
        : NaN;
  if (!Number.isInteger(heroIdNumber) || heroIdNumber <= 0 || heroIdNumber > 2147483647) {
    throw new HttpError(400, 'heroId harus berupa bilangan bulat positif');
  }

  if (!isEnumValue(Currency, currency)) {
    throw new HttpError(400, 'currency harus BP atau DIAMOND');
  }

  // 2. Player harus ada
  const player = await prisma.player.findUnique({ where: { id: playerId } });
  if (!player) {
    throw new HttpError(404, 'Player tidak ditemukan');
  }

  // 3. Hero harus ada
  const hero = await prisma.hero.findUnique({ where: { id: heroIdNumber } });
  if (!hero) {
    throw new HttpError(404, 'Hero tidak ditemukan');
  }

  // 4. Harga untuk mata uang yang dipilih tidak boleh kosong
  const price = currency === 'BP' ? hero.priceBP : hero.priceDiamond;
  if (price == null) {
    throw new HttpError(400, `Hero ${hero.name} tidak bisa dibeli dengan ${currency}`);
  }

  // 5. Satu hero hanya boleh dimiliki satu kali per player
  const owned = await prisma.playerHero.findUnique({
    where: { playerId_heroId: { playerId, heroId: hero.id } },
  });
  if (owned) {
    throw new HttpError(409, `Player sudah memiliki hero ${hero.name}`);
  }

  // 6. Saldo harus cukup
  const balance = currency === 'BP' ? player.bp : player.diamond;
  if (balance < price) {
    throw new HttpError(400, `Saldo ${currency} tidak cukup`);
  }

  // Kurangi saldo dan catat kepemilikan dalam satu transaksi:
  // keduanya berhasil bersama atau gagal bersama.
  const [updatedPlayer] = await prisma.$transaction([
    prisma.player.update({
      where: { id: playerId },
      data:
        currency === 'BP'
          ? { bp: { decrement: price } }
          : { diamond: { decrement: price } },
    }),
    prisma.playerHero.create({
      data: { playerId, heroId: hero.id, currency, pricePaid: price },
    }),
  ]);

  return sendSuccess(res, 201, 'Hero berhasil dibeli', {
    hero: { id: hero.id, name: hero.name },
    currency,
    pricePaid: price,
    balance: { bp: updatedPlayer.bp, diamond: updatedPlayer.diamond },
  });
};
