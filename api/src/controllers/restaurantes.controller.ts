import type { Request, Response } from 'express';
import { obtenerMiRestaurante } from '../services/restaurantes.services.js';

// GET /restaurantes/mio
// Ruta protegida: requiereAuth ya ha puesto el id del usuario en req.userId.
export async function obtenerMio(req: Request, res: Response) {
    const respuesta = await obtenerMiRestaurante(req.userId!);
    res.status(200).json(respuesta);
}
