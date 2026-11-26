import { ErrorApi } from "../utils/error-api.js";

// Lo que le devolvemos al usuario
export interface Lugar {
    placeId: string,
    nombre: string,
    direccion?: string,
    valoracion?: number,
    numResenas?: number,
    fotos?: FotoLugar[];
    googleMapsUri?: string;
}

export interface Atribucion {
    nombre: string;
    uri?: string;
}

// Foto de la tarjeta: name se pasa a /places/photo y las atribuciones se muestran siempre
export interface FotoLugar {
    name: string;
    atribuciones: Atribucion[];
}

export interface PaginaLugares {
    resultados: Lugar[];
    nextPageToken?: string;
}

export interface Foto {
    photoUri: string;
}

// Los campos de Google que pedimos
interface LugarGoogle {
    id: string;
    displayName?: { text: string };
    formattedAddress?: string;
    rating?: number;
    userRatingCount?: number;
    photos?: { name: string; authorAttributions?: { displayName: string; uri?: string }[] }[];
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


// Traduce los errores de Google a los nuestros
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
            ...(pageToken ? { pageToken } : {}),
        })
    })

    await lanzarSiError(respuesta);

    // Leer la respuesta, si no hay resultados Google no manda places
    const datos = await respuesta.json() as { places?: LugarGoogle[]; nextPageToken?: string };

    return {
        resultados: (datos.places ?? []).map((g) => ({
            placeId: g.id,
            nombre: g.displayName?.text ?? '',
            direccion: g.formattedAddress,
            valoracion: g.rating,
            numResenas: g.userRatingCount,
            fotos: g.photos?.slice(0, MAX_FOTOS).map((f) => ({
                name: f.name,
                atribuciones: (f.authorAttributions ?? []).map((a) => ({ nombre: a.displayName, uri: a.uri })),
            })),
            googleMapsUri: g.googleMapsUri,
        })),
        nextPageToken: datos.nextPageToken,
    };
}

export async function obtenerFoto(name: string, maxWidthPx: number): Promise<Foto> {
    // skipHttpRedirect para que devuelva la URL en JSON y no redirija a la imagen
    const respuesta = await fetch(`${URL_BASE}/${name}/media?maxWidthPx=${maxWidthPx}&skipHttpRedirect=true`, {
        headers: { 'X-Goog-Api-Key': process.env.GOOGLE_PLACES_API_KEY! },
    });

    // foto que Google no reconoce
    if (respuesta.status === 400 || respuesta.status === 404) {
        throw new ErrorApi(404, 'NO_ENCONTRADO', 'No existe esa foto');
    }
    await lanzarSiError(respuesta);

    const { photoUri } = await respuesta.json() as { photoUri: string };
    return { photoUri };
}

// Datos básicos del local que se guardan al darlo de alta (D-06)
export interface DetalleLugar {
    placeId: string;
    nombre: string;
    direccion: string;
    municipio: string;
    provincia?: string;
    latitud?: number;
    longitud?: number;
    telefono?: string;
    web?: string;
    tipoGoogle?: string;
    horario?: string[];
    googleMapsUri?: string;
}

// Lo que devuelve Google en Place Details con los campos que pedimos
interface DetalleGoogle {
    id: string;
    displayName?: { text: string };
    formattedAddress?: string;
    addressComponents?: { longText: string; types: string[] }[];
    location?: { latitude: number; longitude: number };
    nationalPhoneNumber?: string;
    websiteUri?: string;
    primaryType?: string;
    regularOpeningHours?: { weekdayDescriptions?: string[] };
    googleMapsUri?: string;
}

// Place Details no lleva el prefijo "places." en los campos
const CAMPOS_DETALLE = [
    'id',
    'displayName',
    'formattedAddress',
    'addressComponents',
    'location',
    'nationalPhoneNumber',
    'websiteUri',
    'primaryType',
    'regularOpeningHours',
    'googleMapsUri',
].join(',');

export async function obtenerDetalleLugar(placeId: string): Promise<DetalleLugar> {
    const url = `${URL_BASE}/places/${encodeURIComponent(placeId)}?languageCode=es&regionCode=ES`;
    const respuesta = await fetch(url, {
        headers: {
            'X-Goog-Api-Key': process.env.GOOGLE_PLACES_API_KEY!,
            'X-Goog-FieldMask': CAMPOS_DETALLE,
        },
    });

    // Un placeId que Google no reconoce es un error del cliente, no de Google
    if (respuesta.status === 400 || respuesta.status === 404) {
        throw new ErrorApi(400, 'VALIDACION', 'Ese local no existe en Google');
    }
    await lanzarSiError(respuesta);

    const g = await respuesta.json() as DetalleGoogle;

    // Busca en la dirección la parte de un tipo, por ejemplo la localidad
    const partes = g.addressComponents ?? [];
    const parte = (tipo: string) => partes.find((p) => p.types.includes(tipo))?.longText;

    return {
        placeId: g.id,
        nombre: g.displayName?.text ?? '',
        direccion: g.formattedAddress ?? '',
        municipio: parte('locality') ?? parte('administrative_area_level_2') ?? '',
        provincia: parte('administrative_area_level_2'),
        latitud: g.location?.latitude,
        longitud: g.location?.longitude,
        telefono: g.nationalPhoneNumber,
        web: g.websiteUri,
        tipoGoogle: g.primaryType,
        horario: g.regularOpeningHours?.weekdayDescriptions,
        googleMapsUri: g.googleMapsUri,
    };
}
