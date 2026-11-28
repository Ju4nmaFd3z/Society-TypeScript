import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, delay, map, timer } from 'rxjs';

export type Origen = 'GOOGLE' | 'WEB' | 'IA' | 'USUARIO';

export type CampoEditable = 'nombre' | 'descripcionCorta' | 'tonos' | 'fraseEjemplo';

export type ValorCampo = string | string[];

export interface Color {
  nombre: string;
  hex: string;
  origen: Origen;
  editado: boolean;
}

export interface Tipografia {
  rol: string;
  familia: string;
  coincidencia: number;
  origen: Origen;
}

export interface Canal {
  tipo: 'WEB' | 'TELEFONO' | 'INSTAGRAM';
  valor: string;
}

export interface Ficha {
  nombre: string;
  descripcionCorta: string;
  tonos: string[];
  fraseEjemplo: string;
  colores: Color[];
  tipografias: Tipografia[];
  canales: Canal[];
  origenPorCampo: Record<CampoEditable | 'colores' | 'tipografias' | 'canales', Origen>;
  version: number;
  origenAlta: 'GOOGLE' | 'MANUAL';
}

export interface ResumenGoogle {
  valoracion: number;
  numResenas: number;
}

export interface EstadoInstagram {
  conectado: boolean;
  usuario?: string;
}

export type ResultadoGuardar = { tipo: 'guardada'; ficha: Ficha } | { tipo: 'conflicto' } | { tipo: 'error' };

export type ResultadoConfirmar = { tipo: 'confirmada' } | { tipo: 'error' };

interface DatosFicha {
  ficha: Ficha;
  resumenGoogle: ResumenGoogle;
  instagram: EstadoInstagram;
}

// PROVISIONAL: ficha de mentira con ficha.json hasta que existan GET y PATCH /restaurantes/{id}/ficha (SOCIETY-70).
@Injectable({ providedIn: 'root' })
export class FichaSimuladaService {
  // Ficha con los cambios de esta sesión; sin ella cada lectura volvería a la del archivo
  private ficha: Ficha | null = null;

  constructor(private http: HttpClient) {}

  obtener(): Observable<Ficha> {
    return this.leer().pipe(map((datos) => (this.ficha ??= datos.ficha)));
  }

  // Va aparte de la ficha porque valoración y reseñas no se guardan (D-06)
  resumenGoogle(): Observable<ResumenGoogle | null> {
    return this.leer().pipe(
      map((datos) => ((this.ficha ?? datos.ficha).origenAlta === 'MANUAL' ? null : datos.resumenGoogle)),
    );
  }

  instagram(): Observable<EstadoInstagram> {
    return this.leer().pipe(map((datos) => datos.instagram));
  }

  // El PATCH real manda {[campo]: valor, version}; si la version no es la guardada, conflicto
  guardarCampo(campo: CampoEditable, valor: ValorCampo, version: number): Observable<ResultadoGuardar> {
    return timer(500).pipe(
      map((): ResultadoGuardar => {
        if (!this.ficha) {
          return { tipo: 'error' };
        }
        if (this.ficha.version !== version) {
          return { tipo: 'conflicto' };
        }
        this.ficha = {
          ...this.ficha,
          [campo]: valor,
          origenPorCampo: { ...this.ficha.origenPorCampo, [campo]: 'USUARIO' },
          version: version + 1,
        };
        return { tipo: 'guardada', ficha: this.ficha };
      }),
    );
  }

  // El PATCH real manda {confirmada: true} y completa el alta
  confirmar(): Observable<ResultadoConfirmar> {
    return timer(500).pipe(map((): ResultadoConfirmar => (this.ficha ? { tipo: 'confirmada' } : { tipo: 'error' })));
  }

  private leer(): Observable<DatosFicha> {
    // Espera como la red, para que se vea el estado cargando
    return this.http.get<DatosFicha>('/datos/ficha.json').pipe(delay(500));
  }
}
