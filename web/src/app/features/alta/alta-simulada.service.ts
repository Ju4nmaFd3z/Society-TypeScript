import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, delay, map, timer } from 'rxjs';
import { SesionSimuladaService } from '../../core/sesion/sesion-simulada.service';

export interface LugarRespuesta {
  placeId: string;
  nombre: string;
  direccion?: string;
  valoracion?: number;
  numResenas?: number;
  fotos?: { name: string; atribuciones: string[] }[];
}

export interface BusquedaRespuesta {
  resultados: LugarRespuesta[];
  nextPageToken?: string;
}

export type TipoLocal = 'RESTAURANTE' | 'BAR' | 'CAFETERIA' | 'OTRO';

export interface AltaGooglePeticion {
  origen: 'GOOGLE';
  googlePlaceId: string;
  declaraGestor: true;
}

export interface AltaManualPeticion {
  origen: 'MANUAL';
  nombre: string;
  direccion: string;
  municipio: string;
  tipo: TipoLocal;
  web?: string;
  instagram?: string;
  declaraGestor: true;
}

export type ResultadoAlta = { tipo: 'creado'; id: string } | { tipo: 'duplicado' } | { tipo: 'error' };

// Un local de locales.json, con la forma que devuelve Google Places
interface LocalGoogle {
  id: string;
  displayName: { text: string };
  formattedAddress?: string;
  rating?: number;
  userRatingCount?: number;
  photos?: { name: string }[];
}

const TAMANO_PAGINA = 6;

// PROVISIONAL: alta de mentira con locales.json, porque la web aún no tiene token y no existe POST /restaurantes.
@Injectable({ providedIn: 'root' })
export class AltaSimuladaService {
  // Id del local creado en esta sesión; con él, un segundo alta es duplicado (D-13)
  private idCreado: string | null = null;

  constructor(
    private http: HttpClient,
    private sesion: SesionSimuladaService,
  ) {}

  // Filtra por nombre o dirección sin distinguir mayúsculas; el pageToken es la posición del primer resultado
  buscar(texto: string, pageToken?: string): Observable<BusquedaRespuesta> {
    const buscado = texto.toLowerCase();

    return this.http.get<{ places: LocalGoogle[] }>('/datos/locales.json').pipe(
      // Espera como la red, para que se vea el estado cargando
      delay(500),
      map(({ places }) => {
        if (buscado === 'error') {
          throw new Error('Fallo simulado de la búsqueda');
        }

        const encontrados = places.filter(
          (local) =>
            local.displayName.text.toLowerCase().includes(buscado) ||
            (local.formattedAddress ?? '').toLowerCase().includes(buscado),
        );
        const inicio = Number(pageToken ?? 0);
        const fin = inicio + TAMANO_PAGINA;

        return {
          resultados: encontrados.slice(inicio, fin).map(aLugar),
          nextPageToken: fin < encontrados.length ? String(fin) : undefined,
        };
      }),
    );
  }

  // Recibe la petición del contrato aunque el simulado no la guarde
  crear(peticion: AltaGooglePeticion | AltaManualPeticion): Observable<ResultadoAlta> {
    return timer(500).pipe(
      map((): ResultadoAlta => {
        // Un local por cuenta (D-13)
        if (this.sesion.altaCompletada() || this.idCreado) {
          return { tipo: 'duplicado' };
        }
        this.idCreado = crypto.randomUUID();
        return { tipo: 'creado', id: this.idCreado };
      }),
    );
  }
}

function aLugar(local: LocalGoogle): LugarRespuesta {
  return {
    placeId: local.id,
    nombre: local.displayName.text,
    direccion: local.formattedAddress,
    valoracion: local.rating,
    numResenas: local.userRatingCount,
    fotos: local.photos?.map((foto) => ({ name: foto.name, atribuciones: [] })),
  };
}
