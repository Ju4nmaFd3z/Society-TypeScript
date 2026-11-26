import type { NextFunction, Request, Response } from 'express';
import { ErrorApi } from '../utils/error-api.js';

// Protege las rutas internas /trabajos. Solo las llama Supabase, que manda
// el secreto en la cabecera X-Trabajos-Secreto; los clientes no lo conocen.
export function requiereSecretoTrabajos(req: Request, _res: Response, next: NextFunction) {
    const secreto = process.env.TRABAJOS_SECRETO;

    // Sin secreto configurado en el servidor, la ruta queda cerrada para todos
    if (!secreto || req.get('X-Trabajos-Secreto') !== secreto) {
        throw new ErrorApi(401, 'SESION_CADUCADA', 'Ruta interna: falta X-Trabajos-Secreto o no es válido');
    }

    next();
}
