import { prisma } from '../src/db/prisma.js';

// Datos de prueba. De momento vacío: aquí irá el local ficticio
// "Bar El Boquerón Dorado" (D-37) cuando existan el resto de tablas.
// Se ejecuta con: npx prisma db seed
async function main() {}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
