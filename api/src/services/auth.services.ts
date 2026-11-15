import { supabase, crearClienteDeSesion } from "../db/supabase.js";
import { ErrorApi } from "../utils/error-api.js";
import { prisma } from "../db/prisma.js";

// Que devuelve la API en inicio de sesión o registro.
export interface Sesion {
    accessToken: string;
    refreshToken: string;
    expiraEn: number;
}

// Registro, crea el usuario en Supabase Auth
// y guarda el perfil con Prisma.

export async function registrar(email: string, contrasena: string, terminosVersion: string): Promise<Sesion> {
    
    // Crear el usuario en Supabase Auth, Supabase guarda la contraseña hasheada
    // nunca se guarda en local.
    const { data, error } = await supabase.auth.admin.createUser({
        email,
        password: contrasena,
        email_confirm: true // la cuenta nace confirmada: no se envía ningún correo
    });

    if (error) {

       if (error.code === "weak_password") {
        throw new ErrorApi(400, 'VALIDACION', 'La contraseña debe tener al menos 6 caracteres.');
       } else if (error.code === "invalid_account") {
        throw new ErrorApi(400, 'VALIDACION', 'Cuenta inválida.');
       }
       if (error.code === "email_exists") {
        throw new ErrorApi(409, 'DUPLICADO', 'Ese email ya tiene cuenta.');
        }
        if (error.code === "over_request_rate_limit") {
            throw new ErrorApi(429, 'LIMITE_ALCANZADO', 'Demasiados intentos. Prueba en unos minutos.', true);
        }

       throw new ErrorApi(503, 'PROVEEDOR_NO_DISPONIBLE', 'Proveedor no disponible. No se pudo crear la cuenta.', true)
       
    }

    // Guarda el perfil del usuario en la base de datos con Prisma
    try {

        await prisma.perfil_usuario.create({
            data: {
                id: data.user.id,
                email,
                terminos_version: terminosVersion, // Obligatiorio de poner.
                terminos_aceptados_en: new Date(),
            },
        })

    } catch (e) {
        await supabase.auth.admin.deleteUser(data.user?.id!);
        throw e;
    }

    // Inicio de sesión para devolver el accessToken y refreshToken
    return iniciarSesion(email, contrasena);
}


// Inicio de sesión en Supabase Auth, devuelve accessToken y refreshToken.
export async function iniciarSesion(email: string, contrasena: string): Promise<Sesion> {
    
    const cliente = crearClienteDeSesion();
    const { data, error } = await cliente.auth.signInWithPassword({
        email,
        password: contrasena,
    });

    if (error) {
        if (error.code === "invalid_credentials") {
            throw new ErrorApi(401, 'CREDENCIALES_INCORRECTAS', 'Credenciales incorrectas.');
        }
        if (error.code === "over_request_rate_limit") {
            throw new ErrorApi(429, "LIMITE_ALCANZADO", "Demasiados intentos alcanzados.")
        }
        throw new ErrorApi(503, 'PROVEEDOR_NO_DISPONIBLE', 'Proveedor no disponible. No se pudo iniciar sesión.', true)
    
    }
    return {
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiraEn: data.session.expires_in
    };
}