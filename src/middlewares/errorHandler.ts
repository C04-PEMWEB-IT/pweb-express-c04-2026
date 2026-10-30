import type { ErrorRequestHandler } from 'express';
import { HttpError } from '../utils/httpError';

// Semua error dibalas dengan format: { status: false, message }
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof HttpError) {
    res.status(err.statusCode).json({ status: false, message: err.message });
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
