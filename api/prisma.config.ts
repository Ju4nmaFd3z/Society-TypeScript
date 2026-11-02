import 'dotenv/config';
import { defineConfig } from 'prisma/config';

// Configuración del CLI de Prisma (migrate, generate, seed).
// El CLI usa DIRECT_URL (session pooler, puerto 5432) porque las migraciones
// necesitan una conexión estable. La API en marcha usa DATABASE_URL (ver src/db/prisma.ts).
// Se lee con process.env y no con env() para que `prisma generate` funcione
// aunque falte la variable (por ejemplo, al instalar en Vercel).
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: process.env.DIRECT_URL ?? '',
  },
});
