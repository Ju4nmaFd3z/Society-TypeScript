import type { Request, Response } from 'express';
import { buscarLugares, obtenerFoto } from '../services/places.services.js';
import { ErrorApi } from '../utils/error-api.js';

// name se pega en la URL de Google, así que solo se acepta "places/{id}/photos/{id}"
const FORMATO_NAME = /^places\/[^/]+\/photos\/[^/]+$/;

// GET /places/search?q=&pageToken=
// Ruta protegida: requiereAuth ya ha comprobado el token antes de llegar aquí.
export async function buscar(req: Request, res: Response) {
    const { q, pageToken } = req.query;

    // q puede llegar como string, como lista (?q=a&q=b) o no llegar
    if (typeof q !== 'string' || q.trim() === '') {
        throw new ErrorApi(400, 'VALIDACION', 'Escribe el nombre del local o la zona');
    }
    // pageToken es opcional
    if (pageToken !== undefined && (typeof pageToken !== 'string' || pageToken === '')) {
        throw new ErrorApi(400, 'VALIDACION', 'pageToken no es válido');
    }

    const pagina = await buscarLugares(q.trim(), pageToken);
    res.status(200).json(pagina);
}

// GET /places/photo?name=&maxWidthPx=
export async function foto(req: Request, res: Response) {
    const { name, maxWidthPx } = req.query;

    if (typeof name !== 'string' || !FORMATO_NAME.test(name)) {
        throw new ErrorApi(400, 'VALIDACION', 'name no es válido');
    }

    // la query llega como texto
    const ancho = typeof maxWidthPx === 'string' ? Number(maxWidthPx) : NaN;
    if (!Number.isInteger(ancho) || ancho < 1 || ancho > 4800) {
        throw new ErrorApi(400, 'VALIDACION', 'maxWidthPx debe ser un entero entre 1 y 4800');
    }

    res.status(200).json(await obtenerFoto(name, ancho));
}
