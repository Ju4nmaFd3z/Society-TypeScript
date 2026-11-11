import { supabase, crearClienteDeSesion } from "../db/supabase.js";
import { ErrorApi } from "../utils/error-api.js";
import { prisma } from "../db/prisma.js";

// Que devuelve la API en inicio de sesión o registro.
export interface Sesion {
    access_token: string;
    refresh_token: string;
    expiracion: number;
}

// Registro, crea el usuario en Supabase Auth
// y guarda el perfil con Prisma.

export async function resgistrar(email: string, contrasena: string, terminosVersion: string): Promise<Sesion> {
    
    // Crear el usuario en Supabase Auth, Supabase guarda la contraseña hasheada
    // nunca se guarda en local.
    const { data, error } = await supabase.auth.signUp({
        email,
        password: contrasena,
        // TODO: Investigar porque no deja agreagar email_confirm = true.
    });

    if (error) {

       if (error.code === "wak_password") {
        throw new Error("La contraseña debe tener al menos 6 caracteres.");
       } else if (error.code === "invalid_account") {
        throw new Error("Cuenta inválida.");
       }
       throw new ErrorApi(503, 'PROVEEDOR_NO_DISPONIBLE', 'Proveedor no disponible. No se pudo crear la cuenta.', true)
       
    }

    // Guarda el perfil del usuario en la base de datos con Prisma
    try {

        await prisma.perfil_usuario.create({
            data: {
                id: data.user?.id!,
                email,
                terminos_version: terminosVersion, // Obligatiorio de poner.
                terminos_aceptados_en: new Date(),
            },
        })

    } catch (e) {
        await supabase.auth.admin.deleteUser(data.user?.id!);
        throw e;
    }

    // Inicio de sesión para devolver el access_token y refresh_token
    return iniciarSesion(email, contrasena);
}


// Inicio de sesión en Supabase Auth, devuelve access_token y refresh_token.
export async function iniciarSesion(email: string, contrasena: string): Promise<Sesion> {
    
    const cliente = crearClienteDeSesion();
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: contrasena,
    });

    if (error) {
        if (error.code === "invalid_credentials") {
            throw new ErrorApi(401, 'CREDENCIALES_INCORRECTAS', 'Credenciales incorrectas.');
        }
        throw new ErrorApi(503, 'PROVEEDOR_NO_DISPONIBLE', 'Proveedor no disponible. No se pudo iniciar sesión.', true)
    
    }
    return {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expiracion: data.session.expires_in
    };
}