import { prisma } from '../db/prisma.js';

// Punto del alta en el que está el usuario. Siempre se filtra por su id:
// nunca se puede ver el local de otro.
export async function obtenerMiRestaurante(userId: string) {
    const local = await prisma.restaurante.findUnique({
        where: { owner_id: userId },
        select: { id: true, nombre: true, origen: true, alta_estado: true },
    });

    // Sin local todavía: el cliente lo manda a buscarlo (S02)
    if (!local) {
        return { restaurante: null, altaEstado: 'SIN_LOCAL' };
    }

    return {
        restaurante: {
            id: local.id,
            nombre: local.nombre,
            origen: local.origen,
            altaEstado: local.alta_estado,
        },
        altaEstado: local.alta_estado,
    };
}
