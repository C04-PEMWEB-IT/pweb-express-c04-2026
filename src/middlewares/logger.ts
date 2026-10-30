import type { NextFunction, Request, Response } from 'express';

// Catat setiap request di terminal, contoh: GET /api/heroes 200
export const logger = (req: Request, res: Response, next: NextFunction) => {
  res.on('finish', () => {
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode}`);
  });
  next();
};
