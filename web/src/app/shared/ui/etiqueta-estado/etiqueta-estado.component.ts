import { Component, computed, input } from '@angular/core';

export type EstadoPieza = 'prevista' | 'publicada' | 'generada' | 'borrador';

const PALABRAS: Record<EstadoPieza, string> = {
  prevista: 'Prevista',
  publicada: 'Publicada',
  generada: 'Generada',
  borrador: 'Borrador',
};

/** Etiqueta de estado: icono con forma distinta (reloj, verificación, rayo o lápiz) y la palabra. */
@Component({
  selector: 'app-etiqueta-estado',
  template: `
    <svg class="icono size-3.5" viewBox="0 0 24 24" aria-hidden="true">
      @switch (estado()) {
        @case ('prevista') {
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        }
        @case ('publicada') {
          <circle cx="12" cy="12" r="9" />
          <path d="M8 12.5l3 3 5-6" />
        }
        @case ('generada') {
          <path d="M13 3L5 13h6l-1 8 8-10h-6z" />
        }
        @case ('borrador') {
          <path d="M4 20l1-4L16 5l3 3L8 19z" />
        }
      }
    </svg>
    <span>{{ palabra() }}</span>
  `,
  host: { class: 'inline-flex items-center gap-espacio-6 text-cuerpo-pequeno-11-5 text-tinta' },
})
export class EtiquetaEstadoComponent {
  readonly estado = input.required<EstadoPieza>();
  protected readonly palabra = computed(() => PALABRAS[this.estado()]);
}
