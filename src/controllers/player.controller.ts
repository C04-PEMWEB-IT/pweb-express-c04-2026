import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { HttpError } from '../utils/httpError';
import { sendSuccess } from '../utils/response';
import { isBlank, parseId } from '../utils/validators';

// POST /api/players
export const createPlayer = async (req: Request, res: Response) => {
  const { nickname } = req.body ?? {};

  // 1. nickname wajib diisi
  if (isBlank(nickname)) {
    throw new HttpError(400, 'nickname wajib diisi');
  }

  const cleanNickname = String(nickname).trim();

  // 2. nickname unik
  const existingPlayer = await prisma.player.findUnique({
    where: { nickname: cleanNickname },
  });
  if (existingPlayer) {
    throw new HttpError(409, 'Nickname sudah dipakai');
  }

  // 3. Saldo awal mengikuti default schema: bp 10000, diamond 0
  const player = await prisma.player.create({
    data: { nickname: cleanNickname },
    select: { id: true, nickname: true, bp: true, diamond: true, createdAt: true },
  });

  return sendSuccess(res, 201, 'Player berhasil dibuat', player);
};

// GET /api/players/:player_id
export const getPlayerDetail = async (req: Request, res: Response) => {
  const playerId = parseId(req.params.player_id, 'player_id');

  const player = await prisma.player.findUnique({
    where: { id: playerId },
    include: {
      heroes: {
        include: {
          hero: {
            select: { name: true },
          },
        },
        orderBy: { id: 'asc' },
      },
    },
  });

  if (!player) {
    throw new HttpError(404, 'Player tidak ditemukan');
  }

  // Ratakan data PlayerHero + nama hero agar response mudah dibaca client
  const data = {
    id: player.id,
    nickname: player.nickname,
    bp: player.bp,
    diamond: player.diamond,
    createdAt: player.createdAt,
    heroes: player.heroes.map((owned) => ({
      heroId: owned.heroId,
      name: owned.hero.name,
      currency: owned.currency,
      pricePaid: owned.pricePaid,
    })),
  };

  return sendSuccess(res, 200, 'Berhasil mengambil data player', data);
};

// PATCH /api/players/:player_id
export const updatePlayer = async (req: Request, res: Response) => {
  const playerId = parseId(req.params.player_id, 'player_id');
  const { nickname } = req.body ?? {};

  // 1. Player harus ada
  const player = await prisma.player.findUnique({ where: { id: playerId } });
  if (!player) {
    throw new HttpError(404, 'Player tidak ditemukan');
  }

  // 2. nickname wajib diisi
  if (isBlank(nickname)) {
    throw new HttpError(400, 'nickname wajib diisi');
  }

  const cleanNickname = String(nickname).trim();

  // 3. nickname tidak boleh dipakai player lain
  const duplicate = await prisma.player.findFirst({
    where: { nickname: cleanNickname, NOT: { id: playerId } },
  });
  if (duplicate) {
    throw new HttpError(409, 'Nickname sudah dipakai player lain');
  }

  const updated = await prisma.player.update({
    where: { id: playerId },
    data: { nickname: cleanNickname },
    select: { id: true, nickname: true, bp: true, diamond: true, createdAt: true },
  });

  return sendSuccess(res, 200, 'Player berhasil diupdate', updated);
};

// DELETE /api/players/:player_id
export const deletePlayer = async (req: Request, res: Response) => {
  const playerId = parseId(req.params.player_id, 'player_id');

  const player = await prisma.player.findUnique({ where: { id: playerId } });
  if (!player) {
    throw new HttpError(404, 'Player tidak ditemukan');
  }

  // PlayerHero ikut terhapus karena relasi memakai onDelete: Cascade
  await prisma.player.delete({ where: { id: playerId } });

  return sendSuccess(res, 200, 'Player berhasil dihapus');
};
