import { Component, Input } from '@angular/core';

// Estado vacío: título, explicación y, dentro, un botón para salir de él
@Component({
  selector: 'app-estado-vacio',
  template: `
    <div class="flex flex-col items-center gap-espacio-8 py-espacio-16 text-center">
      <h2 class="font-display text-titulo-cifra-22 text-tinta">{{ titulo }}</h2>
      <p class="text-cuerpo-intro-15 text-texto-secundario">{{ mensaje }}</p>
      <ng-content></ng-content>
    </div>
  `,
})
export class EstadoVacioComponent {
  @Input() titulo = '';
  @Input() mensaje = '';
}
