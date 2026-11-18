import { Component, Input } from '@angular/core';

// Etiqueta de confianza: tres barras (3, 2 o 1 rellenas) y la palabra
@Component({
  selector: 'app-etiqueta-confianza',
  template: `
    <span class="inline-flex items-center gap-espacio-6 text-cuerpo-pequeno-11-5 text-texto-terciario">
      <span class="flex items-end gap-0.5">
        <span class="h-2 w-1 rounded-sm" [class]="barras >= 1 ? 'bg-tinta' : 'bg-tinta/20'"></span>
        <span class="h-2.5 w-1 rounded-sm" [class]="barras >= 2 ? 'bg-tinta' : 'bg-tinta/20'"></span>
        <span class="h-3 w-1 rounded-sm" [class]="barras >= 3 ? 'bg-tinta' : 'bg-tinta/20'"></span>
      </span>
      {{ palabra }}
    </span>
  `,
})
export class EtiquetaConfianzaComponent {
  @Input() confianza: 'observado' | 'estimado' | 'hipotesis' = 'observado';

  get barras(): number {
    if (this.confianza === 'observado') return 3;
    if (this.confianza === 'estimado') return 2;
    return 1;
  }

  get palabra(): string {
    if (this.confianza === 'observado') return 'Observado';
    if (this.confianza === 'estimado') return 'Estimado';
    return 'Hipótesis';
  }
}
