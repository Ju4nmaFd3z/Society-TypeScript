import { Component, computed, input } from '@angular/core';

export type Confianza = 'observado' | 'estimado' | 'hipotesis';

const NIVELES: Record<Confianza, { palabra: string; barras: number }> = {
  observado: { palabra: 'Observado', barras: 3 },
  estimado: { palabra: 'Estimado', barras: 2 },
  hipotesis: { palabra: 'Hipótesis', barras: 1 },
};

/** Etiqueta de confianza: medidor de tres barras (tres, dos o una rellenas) y la palabra. */
@Component({
  selector: 'app-etiqueta-confianza',
  template: `
    <span class="flex items-end gap-0.5" aria-hidden="true">
      @for (barra of [1, 2, 3]; track barra) {
        <span
          class="w-1 rounded-sm"
          [class]="barra <= nivel().barras ? 'bg-tinta' : 'bg-tinta/20'"
          [style.height.px]="4 + barra * 3"
        ></span>
      }
    </span>
    <span>{{ nivel().palabra }}</span>
  `,
  host: { class: 'inline-flex items-center gap-espacio-6 text-cuerpo-pequeno-11-5 text-texto-terciario' },
})
export class EtiquetaConfianzaComponent {
  readonly confianza = input.required<Confianza>();
  protected readonly nivel = computed(() => NIVELES[this.confianza()]);
}
