import { ErrorApi } from "../utils/error-api.js";

// Lo que le devolvemos al usuario
export interface Lugar {
    placeId: string,
    nombre: string,
    direccion?: string,
    valoracion?: number,
    numResenas?: number,
    fotoNames?: string[];
    googleMapsUri?: string;
}

export interface PaginaLugares {
    resultados: Lugar[];
    nextPageToken?: string; // ausente cuando no hay más páginas
}

export interface Atribucion {
    nombre: string;
    uri?: string;
}

export interface Foto {
    photoUri: string;
    atribuciones: Atribucion[];
}

// Los campos de Google que pedimos
interface LugarGoogle {
    id: string;
    displayName?: { text: string };
    formattedAddress?: string;
    rating?: number;
    userRatingCount?: number;
    photos?: { name: string }[];
    googleMapsUri?: string;
}


const URL_BASE = 'https://places.googleapis.com/v1';
const URL_BUSQUEDA = `${URL_BASE}/places:searchText`;

// Fotos por local para el carrusel de la tarjeta. Google puede traer menos (o ninguna)
const MAX_FOTOS = 5;

// Este es el formato que espera google maps en el que se piden los datos.
const CAMPOS = [
    'places.id',
    'places.displayName',
    'places.formattedAddress',
    'places.rating',
    'places.userRatingCount',
    'places.photos',
    'places.googleMapsUri',
    'nextPageToken'
].join(',');


// Si Google responde con error, lo traducimos a nuestros códigos comunes.
// 429 = cuota agotada; cualquier otro fallo = proveedor caído.
async function lanzarSiError(respuesta: Response): Promise<void> {
    if (respuesta.ok) return;

    console.error('Google Places respondió', respuesta.status, await respuesta.text());

    if (respuesta.status === 429) {
        throw new ErrorApi(429, 'LIMITE_ALCANZADO', 'Demasiadas búsquedas. Prueba en unos minutos.', true);
    }
    throw new ErrorApi(503, 'PROVEEDOR_NO_DISPONIBLE', 'No se pudo buscar en Google. Inténtalo de nuevo.', true);
}

export async function buscarLugares(q: string, pageToken?: string): Promise<PaginaLugares> {

    // Llamada a Google (google pide POST)
    const respuesta = await fetch(URL_BUSQUEDA, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json', // formato JSON
            'X-Goog-Api-Key': process.env.GOOGLE_PLACES_API_KEY!, // API KEY
            'X-Goog-FieldMask': CAMPOS, // campos que se requieren
        },
        body: JSON.stringify({
            textQuery: q,
            languageCode: 'es',
            regionCode: 'ES', // da prioridad a resultados de España
            ...(pageToken ? { pageToken } : {}), // solo se envía si pedimos la página siguiente
        })
    })

    await lanzarSiError(respuesta);

    // Leer la respuesta, si no hay resultados Google no manda places
    const datos = await respuesta.json() as { places?: LugarGoogle[]; nextPageToken?: string };

    return {
        // Traducir cada local de Google al formato del contrato
        resultados: (datos.places ?? []).map((g) => ({
            placeId: g.id,
            nombre: g.displayName?.text ?? '',
            direccion: g.formattedAddress,
            valoracion: g.rating,
            numResenas: g.userRatingCount,
            fotoNames: g.photos?.slice(0, MAX_FOTOS).map((f) => f.name),
            googleMapsUri: g.googleMapsUri,
        })),
        nextPageToken: datos.nextPageToken,
    };
}