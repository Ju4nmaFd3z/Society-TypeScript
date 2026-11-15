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

const URL_BUSQUEDA = 'https://places.googleapis.com/v1/places:searchText';

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
].join(',');


export async function buscarLugares(q: string): Promise<Lugar[]> {

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
            regionCode: 'ES' // da prioridad a resultados de España
        })
    })

    if (!respuesta.ok) {
        console.error('Google Places respondió', respuesta.status, await respuesta.text());
        throw new ErrorApi(503, 'PROVEEDOR_NO_DISPONIBLE', 'No se pudo buscar en Google. Inténtalo de nuevo.', true);
    }

    // Leer la respuesta, si no hay resultados Google no manda places
    const datos = await respuesta.json() as { places?: LugarGoogle[] };

    // Traducir cada local de Google al formato del contrato
    return (datos.places ?? []).map((g) => ({
        placeId: g.id,
        nombre: g.displayName?.text ?? '',
        direccion: g.formattedAddress,
        valoracion: g.rating,
        numResenas: g.userRatingCount,
        fotoNames: g.photos?.slice(0, MAX_FOTOS).map((f) => f.name), // hasta 5 fotos para el carrusel
        googleMapsUri: g.googleMapsUri,
    }));
}