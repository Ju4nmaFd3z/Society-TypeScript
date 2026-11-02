import { prisma } from '../src/db/prisma.js';

// Comprueba que la API llega a Supabase y puede leer la tabla restaurante.
// Uso: npm run db:comprobar
if (!process.env.DATABASE_URL) {
  console.error('Falta DATABASE_URL en api/.env (ver .env.example)');
  process.exit(1);
}

const total = await prisma.restaurante.count();
console.log(`Conexión correcta. Restaurantes en la base de datos: ${total}`);
await prisma.$disconnect();
