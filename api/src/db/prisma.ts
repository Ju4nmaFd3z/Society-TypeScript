import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';

// Un único PrismaClient para toda la API. Se conecta por DATABASE_URL:
// el transaction pooler de Supabase (puerto 6543), pensado para Vercel,
// donde cada petición puede abrir una conexión nueva.
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

export const prisma = new PrismaClient({ adapter });
