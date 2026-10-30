import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { HttpError } from '../utils/httpError';
import { sendSuccess } from '../utils/response';
import { parseId } from '../utils/validators';

const MATCH_REWARD = { WIN: 300, LOSE: 100 } as const;

// POST /api/players/:player_id/topup   body: { amount }
export const topUp = async (req: Request, res: Response) => {
  const playerId = parseId(req.params.player_id, 'player_id');
  const amount = (req.body as { amount?: unknown } | undefined)?.amount;

  // amount harus bilangan bulat > 0 (angka, bukan string) -> kalau tidak 400
  if (typeof amount !== 'number' || !Number.isInteger(amount) || amount <= 0) {
    throw new HttpError(400, 'amount harus berupa bilangan bulat lebih dari 0');
  }

  const player = await prisma.player.findUnique({ where: { id: playerId } });
  if (!player) throw new HttpError(404, 'Player tidak ditemukan');

  const updated = await prisma.player.update({
    where: { id: playerId },
    data: { diamond: { increment: amount } },
  });

  return sendSuccess(res, 200, 'Top up berhasil', {
    playerId: updated.id,
    amount,
    diamond: updated.diamond,
  });
};

// POST /api/players/:player_id/matches   body: { result: "WIN" | "LOSE" }
export const playMatch = async (req: Request, res: Response) => {
  const playerId = parseId(req.params.player_id, 'player_id');
  const result = (req.body as { result?: unknown } | undefined)?.result;

  if (result !== 'WIN' && result !== 'LOSE') {
    throw new HttpError(400, 'result harus WIN atau LOSE');
  }

  const player = await prisma.player.findUnique({ where: { id: playerId } });
  if (!player) throw new HttpError(404, 'Player tidak ditemukan');

  const bpEarned = MATCH_REWARD[result];
  const updated = await prisma.player.update({
    where: { id: playerId },
    data: { bp: { increment: bpEarned } },
  });

  return sendSuccess(res, 200, 'Hadiah match berhasil ditambahkan', {
    playerId: updated.id,
    result,
    bpEarned,
    bp: updated.bp,
  });
};
