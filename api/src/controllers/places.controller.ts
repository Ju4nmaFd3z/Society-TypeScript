import type { Request, Response } from 'express';
import { buscarLugares } from '../services/places.services.js';
import { ErrorApi } from '../utils/error-api.js';

// GET /places/search?q=
// Ruta protegida: requiereAuth ya ha comprobado el token antes de llegar aquí.
export async function buscar(req: Request, res: Response) {
    const q = req.query.q;

    // q puede llegar como string, como lista (?q=a&q=b) o no llegar
    if (typeof q !== 'string' || q.trim() === '') {
        throw new ErrorApi(400, 'VALIDACION', 'Escribe el nombre del local o la zona');
    }

    const resultados = await buscarLugares(q.trim());
    res.status(200).json({ resultados });
}
