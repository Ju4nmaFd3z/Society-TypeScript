import type { Request, Response } from 'express';
import { buscarLugares } from '../services/places.services.js';
import { ErrorApi } from '../utils/error-api.js';

// GET /places/search?q=&pageToken=
// Ruta protegida: requiereAuth ya ha comprobado el token antes de llegar aquí.
export async function buscar(req: Request, res: Response) {
    const { q, pageToken } = req.query;

    // q puede llegar como string, como lista (?q=a&q=b) o no llegar
    if (typeof q !== 'string' || q.trim() === '') {
        throw new ErrorApi(400, 'VALIDACION', 'Escribe el nombre del local o la zona');
    }
    // pageToken es opcional, pero si llega tiene que ser un solo texto
    if (pageToken !== undefined && (typeof pageToken !== 'string' || pageToken === '')) {
        throw new ErrorApi(400, 'VALIDACION', 'pageToken no es válido');
    }

    const pagina = await buscarLugares(q.trim(), pageToken);
    res.status(200).json(pagina);
}
