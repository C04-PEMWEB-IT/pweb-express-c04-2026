import { Prisma } from '../generated/prisma';

// P2002 = unique constraint violation (mis. nickname / nama hero sudah dipakai)
export const isUniqueViolation = (err: unknown): boolean =>
  err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002';
