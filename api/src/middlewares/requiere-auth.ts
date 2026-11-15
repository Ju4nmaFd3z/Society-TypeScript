import type { NextFunction, Request, Response } from "express";
import { supabase } from "../db/supabase.js";
import { ErrorApi } from "../utils/error-api.js";
import { isAuthRetryableFetchError } from '@supabase/supabase-js';


// Protege una ruta exigiendo el token de acceso.
export async function requiereAuth(req: Request, _res: Response, next: NextFunction) {
    const cabecera = req.headers.authorization;

    if (!cabecera?.startsWith('Bearer ')) {
         throw new ErrorApi(401, 'SESION_CADUCADA', 'Sesión caducada o no válida');
    }

    const token = cabecera.slice(7).trim(); // Se quita 'Bearer '

    const { data, error } = await supabase.auth.getUser(token); // validacion con Supabase

    // Supabase no responde: no es culpa del token, que el cliente reintente
    if (isAuthRetryableFetchError(error)) {
        throw new ErrorApi(503, 'PROVEEDOR_NO_DISPONIBLE', 'No se pudo comprobar la sesión. Inténtalo de nuevo.', true);
    }
    // Token caducado, falso o de un usuario que ya no existe
    if (error || !data.user) {
        throw new ErrorApi(401, 'SESION_CADUCADA', 'Sesión caducada o no válida');
    }

    req.userId = data.user.id;
    next(); // el controlador es el que responde, no hay que poner nada más de next.

}