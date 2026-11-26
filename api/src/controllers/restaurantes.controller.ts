import type { Request, Response } from 'express';
import { crearRestaurante, obtenerMiRestaurante } from '../services/restaurantes.services.js';
import { altaRestaurante } from '../validaciones/restaurantes.validaciones.js';
import { ErrorApi } from '../utils/error-api.js';

// GET /restaurantes/mio
// Ruta protegida: requiereAuth ya ha puesto el id del usuario en req.userId.
export async function obtenerMio(req: Request, res: Response) {
    const respuesta = await obtenerMiRestaurante(req.userId!);
    res.status(200).json(respuesta);
}

// POST /restaurantes
// Body {origen: GOOGLE, googlePlaceId, declaraGestor}
//   o  {origen: MANUAL, nombre, direccion, municipio, tipo, web?, instagram?, declaraGestor}
export async function crear(req: Request, res: Response) {
    const resultado = altaRestaurante.safeParse(req.body);

    // Se devuelve el primer fallo, que es el que el usuario tiene que corregir
    if (!resultado.success) {
        throw new ErrorApi(400, 'VALIDACION', resultado.error.issues[0].message);
    }

    const local = await crearRestaurante(req.userId!, resultado.data);
    res.status(201).json(local);
}
