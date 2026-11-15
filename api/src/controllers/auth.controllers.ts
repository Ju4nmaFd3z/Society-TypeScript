import type { Request, Response } from 'express';
import { registrar, iniciarSesion } from '../services/auth.services.js';
import { ErrorApi } from '../utils/error-api.js';

// Post auth/registro
// Body {email, contrasena, terminosVersion}
export async function crearCuenta(req: Request, res: Response) {
    const {
        email, 
        contrasena, 
        terminosVersion
    } = req.body ?? {};

    // Validación básica antes de llamar a Supabase si falta algo
    manejoDeErroresComunes(email, contrasena);

    if (typeof terminosVersion !== 'string' || terminosVersion.trim() === '') {
        throw new ErrorApi(400, 'VALIDACION', 'Hay que aceptar los términos');
    }

    const sesion = await registrar(email.trim().toLowerCase(), contrasena, terminosVersion);
    res.status(201).json(sesion);

}

export async function acceder(req: Request, res: Response) {
    const { email, contrasena } = req.body ?? {};

    manejoDeErroresComunes(email, contrasena);

    const sesion = await iniciarSesion(email.trim().toLowerCase(), contrasena)
    res.status(200).json(sesion)
}


function manejoDeErroresComunes(email: any, contrasena: any) {
    if (typeof email !== 'string' || !email.includes('@') || email.length > 254 ) {
        throw new ErrorApi(400, 'VALIDACION', 'Email inválido');
    }
    if (typeof contrasena !== 'string' || contrasena.length < 8) {
        throw new ErrorApi(400, 'VALIDACION', 'La contraseña debe tener al menos 8 caracteres');
    }
}