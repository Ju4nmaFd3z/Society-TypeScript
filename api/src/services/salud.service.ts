// Servicio: la lógica de negocio. No sabe nada de Express (ni req ni res).
// Cuando haya Prisma, aquí se comprobará también la conexión con la base de datos.
export function comprobarSalud() {
  return { ok: true };
}
