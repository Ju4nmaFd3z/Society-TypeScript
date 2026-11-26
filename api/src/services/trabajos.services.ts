import { prisma } from '../db/prisma.js';
import type { Prisma, trabajo } from '../generated/prisma/client.js';
import { manejadores, type ResultadoFase } from '../trabajos/manejadores.js';

// Esperas antes de cada reintento de una fase que falla: 10 s, 30 s y 90 s (D-36)
const ESPERAS_REINTENTO = [10, 30, 90];

// Un trabajo EN_CURSO desde hace más de 10 minutos está colgado:
// la función de Vercel murió a medias (como mucho dura 300 s)
const MINUTOS_COLGADO = 10;

// Tiempo máximo que una llamada se queda ejecutando trabajos,
// con margen dentro de los 300 s que da Vercel
const SEGUNDOS_MAXIMOS = 240;

// Fecha de dentro de N segundos
function dentroDe(segundos: number): Date {
    return new Date(Date.now() + segundos * 1000);
}

// Reclama el siguiente trabajo pendiente y lo deja EN_CURSO.
// Prisma no llama a funciones de Postgres, así que va en SQL (está en la migración).
async function reclamarTrabajo(): Promise<trabajo | null> {
    const filas = await prisma.$queryRaw<{ id: string }[]>`SELECT "id" FROM reclamar_trabajo()`;
    if (filas.length === 0) {
        return null;
    }
    return prisma.trabajo.findUnique({ where: { id: filas[0].id } });
}

// Guarda cómo queda el trabajo. Solo si sigue EN_CURSO: si alguien lo canceló
// mientras se ejecutaba, se respeta el CANCELADO.
async function guardar(id: string, cambios: Prisma.trabajoUpdateManyMutationInput) {
    await prisma.trabajo.updateMany({
        where: { id, estado: 'EN_CURSO' },
        data: { ...cambios, bloqueado_en: null },
    });
}

// Ejecuta UNA fase del trabajo y decide cómo sigue
async function ejecutarFase(t: trabajo) {
    const manejador = manejadores[t.tipo];
    if (!manejador) {
        await guardar(t.id, { estado: 'ERROR', error: `No hay manejador para el tipo ${t.tipo}` });
        return;
    }

    let resultado: ResultadoFase;
    try {
        resultado = await manejador(t);
    } catch (e) {
        // La fase ha fallado: se reintenta más tarde o, si ya no quedan intentos, ERROR
        const intentos = t.intentos + 1;
        const mensaje = e instanceof Error ? e.message : String(e);
        console.error(`Trabajo ${t.id} (${t.tipo}), fase ${t.fase}, intento ${intentos}: ${mensaje}`);

        if (intentos > ESPERAS_REINTENTO.length) {
            await guardar(t.id, { estado: 'ERROR', intentos, error: mensaje });
        } else {
            await guardar(t.id, {
                estado: 'PENDIENTE',
                intentos,
                error: mensaje,
                ejecutar_despues_de: dentroDe(ESPERAS_REINTENTO[intentos - 1]),
            });
        }
        return;
    }

    if (resultado.terminado) {
        await guardar(t.id, { estado: 'HECHO', intentos: 0, error: null, datos: resultado.datos });
    } else {
        // Queda otra fase: vuelve a la cola, con su espera si la hay
        await guardar(t.id, {
            estado: 'PENDIENTE',
            fase: t.fase + 1,
            intentos: 0,
            error: null,
            datos: resultado.datos,
            ejecutar_despues_de: dentroDe(resultado.esperarSegundos ?? 0),
        });
    }
}

// Ejecuta trabajos pendientes, uno tras otro, hasta que no quede ninguno
// listo o se acabe el tiempo. Devuelve cuántas fases ha ejecutado.
export async function ejecutarPendientes(): Promise<number> {
    const inicio = Date.now();
    let ejecutados = 0;

    while (Date.now() - inicio < SEGUNDOS_MAXIMOS * 1000) {
        const t = await reclamarTrabajo();
        if (!t) {
            break;
        }
        await ejecutarFase(t);
        ejecutados++;
    }

    return ejecutados;
}

// Lo llama pg_cron cada minuto: rescata los trabajos colgados y ejecuta
// los pendientes cuya espera ya ha vencido (reintentos y fases con espera).
export async function barrido() {
    const limite = new Date(Date.now() - MINUTOS_COLGADO * 60 * 1000);
    const colgado = { estado: 'EN_CURSO', bloqueado_en: { lt: limite } };

    // Colgados que ya agotaron los reintentos: se dan por perdidos
    const perdidos = await prisma.trabajo.updateMany({
        where: { ...colgado, intentos: { gte: ESPERAS_REINTENTO.length } },
        data: { estado: 'ERROR', bloqueado_en: null, error: 'Se quedó colgado demasiadas veces' },
    });

    // El resto vuelve a la cola, contando como un intento fallido más
    const rescatados = await prisma.trabajo.updateMany({
        where: colgado,
        data: {
            estado: 'PENDIENTE',
            bloqueado_en: null,
            intentos: { increment: 1 },
            error: 'Se quedó colgado; se reintenta',
        },
    });

    const ejecutados = await ejecutarPendientes();

    return { rescatados: rescatados.count, perdidos: perdidos.count, ejecutados };
}
