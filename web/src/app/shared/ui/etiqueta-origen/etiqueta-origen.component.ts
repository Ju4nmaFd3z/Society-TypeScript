import { Component, Input } from '@angular/core';

// Etiqueta de origen: un icono y la palabra (Google, Tu web, IA o Tú)
@Component({
  selector: 'app-etiqueta-origen',
  template: `
    <span class="inline-flex items-center gap-espacio-6 text-cuerpo-pequeno-11-5 text-texto-terciario">
      <svg class="icono size-3.5" viewBox="0 0 24 24">
        @if (origen === 'google') {
          <circle cx="12" cy="12" r="9" />
          <path d="M16 9.5a5 5 0 1 0 .6 4.5H12" />
        } @else if (origen === 'tu-web') {
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18" />
        } @else if (origen === 'ia') {
          <path d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" />
        } @else {
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" />
        }
      </svg>
      {{ palabra }}
    </span>
  `,
})
export class EtiquetaOrigenComponent {
  @Input() origen: 'google' | 'tu-web' | 'ia' | 'tu' = 'google';

  get palabra(): string {
    if (this.origen === 'google') return 'Google';
    if (this.origen === 'tu-web') return 'Tu web';
    if (this.origen === 'ia') return 'IA';
    return 'Tú';
  }
}
