import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

// Prisma 7: URL database untuk Prisma CLI diatur di sini (bukan di schema.prisma).
// Prisma CLI memakai direct connection; aplikasi memakai pooled connection lewat adapter.
export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: env('DIRECT_URL'),
  },
});
