import type { Request, Response } from 'express';
import { barrido, ejecutarPendientes } from '../services/trabajos.services.js';

// POST /trabajos/ejecutar
// Lo llama Supabase cada vez que se inserta un trabajo.
export async function ejecutar(_req: Request, res: Response) {
    const ejecutados = await ejecutarPendientes();
    res.status(200).json({ ejecutados });
}

// POST /trabajos/barrido
// Lo llama pg_cron cada minuto.
export async function barrer(_req: Request, res: Response) {
    const resultado = await barrido();
    res.status(200).json(resultado);
}
