import { prisma } from '../db/prisma.js';
import { ErrorApi } from '../utils/error-api.js';
import { obtenerDetalleLugar } from './places.services.js';
import type { AltaGoogle, AltaManual, AltaRestaurante } from '../validaciones/restaurantes.validaciones.js';

// Lo que devuelve la API al crear el local (RestauranteResumen en el contrato)
export interface RestauranteResumen {
    id: string;
    nombre: string;
    origen: string;
    altaEstado: string;
}

// Un canal del local: su web, su Instagram o su teléfono
interface CanalNuevo {
    tipo: string;
    valor: string;
    fuente: string;
}

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

// Alta del local, desde Google o a mano. El local nace en CREADO.
export async function crearRestaurante(userId: string, datos: AltaRestaurante): Promise<RestauranteResumen> {
    // Un local por cuenta (D-13)
    const yaTiene = await prisma.restaurante.findUnique({
        where: { owner_id: userId },
        select: { id: true },
    });
    if (yaTiene) {
        throw new ErrorApi(409, 'DUPLICADO', 'Ya tienes un local dado de alta');
    }

    try {
        const local = datos.origen === 'GOOGLE'
            ? await crearDesdeGoogle(userId, datos)
            : await crearAMano(userId, datos);

        return {
            id: local.id,
            nombre: local.nombre,
            origen: local.origen,
            altaEstado: local.alta_estado,
        };
    } catch (e) {
        // Dos altas a la vez con el mismo usuario o el mismo local:
        // la base de datos rechaza la segunda por los campos únicos
        if (esDuplicado(e)) {
            throw new ErrorApi(409, 'DUPLICADO', 'Ese local ya está dado de alta');
        }
        throw e;
    }
}

// S02: los datos básicos se leen de Google (Place Details) y se guardan (D-06)
async function crearDesdeGoogle(userId: string, datos: AltaGoogle) {
    // Cada local de Google solo puede tenerlo una cuenta (D-13)
    const otroDueno = await prisma.restaurante.findUnique({
        where: { google_place_id: datos.googlePlaceId },
        select: { id: true },
    });
    if (otroDueno) {
        throw new ErrorApi(409, 'DUPLICADO', 'Este local ya está dado de alta con otra cuenta');
    }

    const lugar = await obtenerDetalleLugar(datos.googlePlaceId);

    // Web y teléfono, si Google los tiene, como canales con fuente GOOGLE
    const canales: CanalNuevo[] = [];
    if (lugar.web) {
        canales.push({ tipo: 'WEB', valor: lugar.web, fuente: 'GOOGLE' });
    }
    if (lugar.telefono) {
        canales.push({ tipo: 'TELEFONO', valor: lugar.telefono, fuente: 'GOOGLE' });
    }

    // El restaurante y sus canales se crean juntos: o se guarda todo o nada
    return prisma.restaurante.create({
        data: {
            owner_id: userId,
            origen: 'GOOGLE',
            google_place_id: lugar.placeId,
            nombre: lugar.nombre,
            direccion: lugar.direccion,
            municipio: lugar.municipio,
            provincia: lugar.provincia,
            latitud: lugar.latitud,
            longitud: lugar.longitud,
            telefono: lugar.telefono,
            tipo_google: lugar.tipoGoogle,
            horario: lugar.horario,
            google_maps_uri: lugar.googleMapsUri,
            datos_google_leidos_en: new Date(),
            declara_gestor_en: new Date(),
            canales: { create: canales },
        },
    });
}

// S02M: se guarda lo que escribe el usuario, con fuente USUARIO
async function crearAMano(userId: string, datos: AltaManual) {
    const canales: CanalNuevo[] = [];
    if (datos.web) {
        canales.push({ tipo: 'WEB', valor: datos.web, fuente: 'USUARIO' });
    }
    if (datos.instagram) {
        canales.push({ tipo: 'INSTAGRAM', valor: `@${datos.instagram}`, fuente: 'USUARIO' });
    }

    return prisma.restaurante.create({
        data: {
            owner_id: userId,
            origen: 'MANUAL',
            nombre: datos.nombre,
            tipo: datos.tipo,
            direccion: datos.direccion,
            municipio: datos.municipio,
            declara_gestor_en: new Date(),
            canales: { create: canales },
        },
    });
}

// P2002 es el código de Prisma para «ya existe un registro con ese valor único»
function esDuplicado(e: unknown): boolean {
    return typeof e === 'object' && e !== null && 'code' in e && e.code === 'P2002';
}
