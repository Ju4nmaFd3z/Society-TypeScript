import { Component, Input } from '@angular/core';

// Etiqueta de estado de una pieza: un icono y la palabra
@Component({
  selector: 'app-etiqueta-estado',
  template: `
    <span class="inline-flex items-center gap-espacio-6 text-cuerpo-pequeno-11-5 text-tinta">
      <svg class="icono size-3.5" viewBox="0 0 24 24">
        @if (estado === 'prevista') {
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        } @else if (estado === 'publicada') {
          <circle cx="12" cy="12" r="9" />
          <path d="M8 12.5l3 3 5-6" />
        } @else if (estado === 'generada') {
          <path d="M13 3L5 13h6l-1 8 8-10h-6z" />
        } @else {
          <path d="M4 20l1-4L16 5l3 3L8 19z" />
        }
      </svg>
      {{ palabra }}
    </span>
  `,
})
export class EtiquetaEstadoComponent {
  @Input() estado: 'prevista' | 'publicada' | 'generada' | 'borrador' = 'prevista';

  get palabra(): string {
    if (this.estado === 'prevista') return 'Prevista';
    if (this.estado === 'publicada') return 'Publicada';
    if (this.estado === 'generada') return 'Generada';
    return 'Borrador';
  }
}
