import type { Request, Response } from 'express';
import { resgistrar } from '../services/auth.services.js';
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
    if (typeof email !== 'string' || !email.includes('@') || email.length > 254 ) {
        throw new ErrorApi(400, 'VALIDACION', 'Email inválido');
    }
    if (typeof contrasena !== 'string' || contrasena.length < 8) {
        throw new ErrorApi(400, 'VALIDACION', 'La contraseña debe tener al menos 8 caracteres');
    }
    if (typeof terminosVersion !== 'string' || terminosVersion.trim() === '') {
        throw new ErrorApi(400, 'VALIDACION', 'Hay que aceptar los términos');
    }

    const sesion = await resgistrar(email.trim().toLowerCase(), contrasena, terminosVersion);
    res.status(201).json(sesion);

    }