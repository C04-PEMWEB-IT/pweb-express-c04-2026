import type { ErrorRequestHandler } from 'express';
import { HttpError } from '../utils/httpError';

const prismaErrorCode = (err: unknown): string | undefined => {
  if (err && typeof err === 'object' && 'code' in err) {
    const { code } = err as { code?: unknown };
    if (typeof code === 'string' && code.startsWith('P')) return code;
  }
  return undefined;
};

// Semua error dibalas dengan format: { status: false, message }
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof HttpError) {
    res.status(err.statusCode).json({ status: false, message: err.message });
    return;
  }

  // Error bawaan Prisma (mis. unique bentrok karena request bersamaan)
  const code = prismaErrorCode(err);
  if (code === 'P2002') {
    res.status(409).json({ status: false, message: 'Data sudah ada (nilai unik bentrok)' });
    return;
  }
  if (code === 'P2025') {
    res.status(404).json({ status: false, message: 'Data tidak ditemukan' });
    return;
  }
  if (code === 'P2003') {
    res.status(400).json({ status: false, message: 'Relasi data tidak valid' });
    return;
  }

  // Body JSON rusak (mis. kurang tanda kutip)
  if (err && typeof err === 'object' && (err as { type?: string }).type === 'entity.parse.failed') {
    res.status(400).json({ status: false, message: 'Body request bukan JSON yang valid' });
    return;
  }

  console.error(err);
  res.status(500).json({ status: false, message: 'Terjadi kesalahan pada server' });
};
