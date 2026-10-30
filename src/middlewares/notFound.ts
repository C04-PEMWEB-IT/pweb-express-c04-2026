import type { NextFunction, Request, Response } from 'express';
import { HttpError } from '../utils/httpError';

// URL yang tidak terdaftar -> 404
export const notFound = (req: Request, _res: Response, next: NextFunction) => {
  next(new HttpError(404, `Endpoint ${req.method} ${req.originalUrl} tidak ditemukan`));
};
