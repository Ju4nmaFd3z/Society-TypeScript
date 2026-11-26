import type { Prisma, trabajo } from '../generated/prisma/client.js';

// Lo que devuelve cada fase: o el trabajo ha terminado, o queda otra fase.
// esperarSegundos sirve para fases que esperan a algo, como el webhook de Higgsfield.
export type ResultadoFase =
    | { terminado: true; datos?: Prisma.InputJsonValue }
    | { terminado: false; esperarSegundos?: number; datos?: Prisma.InputJsonValue };

// Una función por tipo de trabajo. Recibe el trabajo con su fase y sus datos,
// hace UNA fase corta y dice cómo sigue. Si lanza un error, se reintenta.
export type Manejador = (t: trabajo) => Promise<ResultadoFase>;

// Trabajo de prueba de SOCIETY-59. Por defecto hace una fase y termina.
// Con datos {"fases": 3} hace tres fases y con {"fallar": true} falla siempre,
// para probar los reintentos.
async function prueba(t: trabajo): Promise<ResultadoFase> {
    const datos = t.datos as { fases?: number; fallar?: boolean };

    if (datos.fallar) {
        throw new Error('Fallo de prueba');
    }

    const fases = datos.fases ?? 1;
    console.log(`Trabajo de prueba ${t.id}: fase ${t.fase + 1} de ${fases}`);

    if (t.fase + 1 >= fases) {
        return { terminado: true };
    }
    return { terminado: false };
}

// Cada tipo de trabajo con su función. ANALISIS (SOCIETY-60), PLAN_PIEZA...
// se irán añadiendo aquí en sus tareas.
export const manejadores: Record<string, Manejador> = {
    PRUEBA: prueba,
};
