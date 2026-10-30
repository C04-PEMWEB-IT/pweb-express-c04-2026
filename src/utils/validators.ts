import type { Request } from 'express';
import { HttpError } from './httpError';

const MAX_INT32 = 2147483647;

// Cek apakah nilai termasuk salah satu nilai enum Prisma (mis. Role, Lane, Rarity, Currency)
export const isEnumValue = <T extends Record<string, string>>(
  enumObject: T,
  value: unknown,
): value is T[keyof T] => typeof value === 'string' && Object.values(enumObject).includes(value);

// Nilai dianggap kosong: undefined, null, atau string kosong/spasi saja
export const isBlank = (value: unknown): boolean =>
  value === undefined || value === null || (typeof value === 'string' && value.trim() === '');

// Ubah parameter URL (string) menjadi id angka. Bukan angka -> 400
export const parseId = (value: string | undefined, label: string): number => {
  if (value === undefined || !/^\d+$/.test(value)) {
    throw new HttpError(400, `${label} harus berupa angka`);
  }
  const id = Number(value);
  if (id > MAX_INT32) {
    throw new HttpError(400, `${label} tidak valid`);
  }
  return id;
};

const parsePositiveInt = (value: unknown, fallback: number, label: string): number => {
  if (value === undefined || value === '') return fallback;
  const num = typeof value === 'string' ? Number(value) : NaN;
  if (!Number.isInteger(num) || num < 1) {
    throw new HttpError(400, `${label} harus bilangan bulat lebih dari 0`);
  }
  return num;
};

// Query pagination: ?page=1&limit=10 (default page=1, limit=10)
export const parsePagination = (query: Request['query']) => {
  const page = parsePositiveInt(query.page, 1, 'page');
  const limit = parsePositiveInt(query.limit, 10, 'limit');
  return { page, limit, skip: (page - 1) * limit };
};
