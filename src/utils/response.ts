import type { Response } from 'express';

export interface Metadata {
  currentPage: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export const buildMetadata = (page: number, limit: number, totalItems: number): Metadata => ({
  currentPage: page,
  limit,
  totalItems,
  totalPages: Math.ceil(totalItems / limit),
});

// Format response sukses: { status: true, message, data?, metadata? }
export const sendSuccess = (
  res: Response,
  statusCode: number,
  message: string,
  data?: unknown,
  metadata?: Metadata,
) => {
  const body: Record<string, unknown> = { status: true, message };
  if (data !== undefined) body.data = data;
  if (metadata) body.metadata = metadata;
  return res.status(statusCode).json(body);
};
