import { z } from 'zod';

// Reglas del cuerpo de POST /restaurantes, las mismas que el contrato.
// zod comprueba el JSON y, si es correcto, lo deja ya tipado.

// Casilla «Soy propietario o gestor»: tiene que llegar marcada
const declaraGestor = z.literal(true, 'Tienes que confirmar que eres propietario o gestor del local');

// Alta desde S02: el usuario elige un resultado de /places/search
const altaGoogle = z.object({
    origen: z.literal('GOOGLE'),
    googlePlaceId: z.string('Falta el local elegido').trim().min(1, 'Falta el local elegido'),
    declaraGestor,
});

// Alta a mano desde S02M: el usuario escribe los datos
const altaManual = z.object({
    origen: z.literal('MANUAL'),
    nombre: z.string('Falta el nombre').trim()
        .min(2, 'El nombre debe tener entre 2 y 80 caracteres')
        .max(80, 'El nombre debe tener entre 2 y 80 caracteres'),
    direccion: z.string('Falta la dirección').trim()
        .min(3, 'La dirección debe tener entre 3 y 120 caracteres')
        .max(120, 'La dirección debe tener entre 3 y 120 caracteres'),
    municipio: z.string('Falta el municipio').trim()
        .min(2, 'El municipio debe tener entre 2 y 60 caracteres')
        .max(60, 'El municipio debe tener entre 2 y 60 caracteres'),
    tipo: z.enum(['RESTAURANTE', 'BAR', 'CAFETERIA', 'OTRO'], 'Elige el tipo de local'),
    // Opcionales: si el usuario no los rellena, el cliente no los envía
    web: z.string().trim()
        .regex(/^https:\/\/\S+$/, 'La web tiene que empezar por https://')
        .max(200, 'La web es demasiado larga')
        .optional(),
    instagram: z.string().trim()
        .regex(/^[a-z0-9._]{1,30}$/, 'El usuario de Instagram no es válido (sin @, en minúscula)')
        .optional(),
    declaraGestor,
});

// Según el campo origen, zod aplica una regla u otra
export const altaRestaurante = z.discriminatedUnion('origen', [altaGoogle, altaManual], 'El origen tiene que ser GOOGLE o MANUAL');

export type AltaGoogle = z.infer<typeof altaGoogle>;
export type AltaManual = z.infer<typeof altaManual>;
export type AltaRestaurante = z.infer<typeof altaRestaurante>;
