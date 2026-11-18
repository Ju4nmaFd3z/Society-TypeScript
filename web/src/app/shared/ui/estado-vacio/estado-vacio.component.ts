import { Component, input } from '@angular/core';

/** Estado vacío: título, explicación y, si hace falta, una salida proyectada (un botón). */
@Component({
  selector: 'app-estado-vacio',
  template: `
    <div class="flex flex-col items-center gap-espacio-8 py-espacio-16 text-center">
      <h2 class="font-display text-titulo-cifra-22 text-tinta">{{ titulo() }}</h2>
      @if (mensaje()) {
        <p class="max-w-sm text-cuerpo-intro-15 text-texto-secundario">{{ mensaje() }}</p>
      }
      <div class="mt-espacio-8"><ng-content /></div>
    </div>
  `,
})
export class EstadoVacioComponent {
  readonly titulo = input.required<string>();
  readonly mensaje = input('');
}
