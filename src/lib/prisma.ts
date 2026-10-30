import 'dotenv/config';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from '../generated/prisma';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL belum diisi. Salin .env.example menjadi .env lalu isi connection string Neon (pooled).');
}

// Prisma 7 + Neon: koneksi lewat driver adapter (pakai pooled connection string)
const adapter = new PrismaNeon({ connectionString });

export const prisma = new PrismaClient({ adapter });
