import { createClient } from "@supabase/supabase-js"

// Cliente de Supabase. Solo lo utilizamos para el Auth de Supabase:
// crear usuarios, iniciar sesión, cerrar sesión, etc. No lo usamos para la base de datos.
function crearCliente() {
  return createClient(
    process.env.SUPABASE_URL!, 
    process.env.SUPABASE_SECRET_KEY!, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
  })
}

// Cliente compartido por toda la API, 
// para que no se creen múltiples instancias de Supabase en cada request.
export const supabase = crearCliente()

// Para iniciar sesión utilizamos un cliente cada vez, 
// para que no se comparta la sesión entre usuarios. 
// Esto es importante para la seguridad.
export const crearClienteDeSesion = crearCliente;