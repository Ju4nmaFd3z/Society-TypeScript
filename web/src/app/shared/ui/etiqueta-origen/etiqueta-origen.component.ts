import { Component, computed, input } from '@angular/core';

export type Origen = 'google' | 'tu-web' | 'ia' | 'tu';

const PALABRAS: Record<Origen, string> = {
  google: 'Google',
  'tu-web': 'Tu web',
  ia: 'IA',
  tu: 'Tú',
};

/**
 * Etiqueta de origen: marca pequeña de la fuente y la palabra, en el texto terciario.
 * Cada origen tiene una marca de forma distinta: no depende del color.
 */
@Component({
  selector: 'app-etiqueta-origen',
  template: `
    <svg class="icono size-3.5" viewBox="0 0 24 24" aria-hidden="true">
      @switch (origen()) {
        @case ('google') {
          <circle cx="12" cy="12" r="9" />
          <path d="M16 9.5a5 5 0 1 0 .6 4.5H12" />
        }
        @case ('tu-web') {
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18" />
        }
        @case ('ia') {
          <path d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" />
        }
        @case ('tu') {
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" />
        }
      }
    </svg>
    <span>{{ palabra() }}</span>
  `,
  host: { class: 'inline-flex items-center gap-espacio-6 text-cuerpo-pequeno-11-5 text-texto-terciario' },
})
export class EtiquetaOrigenComponent {
  readonly origen = input.required<Origen>();
  protected readonly palabra = computed(() => PALABRAS[this.origen()]);
}
