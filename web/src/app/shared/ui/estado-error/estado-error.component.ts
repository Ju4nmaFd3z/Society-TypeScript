import { Component, input, output } from '@angular/core';
import { BotonComponent } from '../boton/boton.component';

/** Estado de error: aviso y botón «Reintentar». Las lecturas se reintentan; las escrituras, nunca solas. */
@Component({
  selector: 'app-estado-error',
  imports: [BotonComponent],
  template: `
    <div class="flex flex-col items-center gap-espacio-8 py-espacio-16 text-center" role="alert">
      <h2 class="font-display text-titulo-cifra-22 text-tinta">{{ titulo() }}</h2>
      @if (mensaje()) {
        <p class="max-w-sm text-cuerpo-intro-15 text-texto-secundario">{{ mensaje() }}</p>
      }
      <button appBoton variante="secundario" type="button" class="mt-espacio-8" (click)="reintentar.emit()">Reintentar</button>
    </div>
  `,
})
export class EstadoErrorComponent {
  readonly titulo = input('Revisa tu conexión');
  readonly mensaje = input('No hemos podido cargar los datos.');
  readonly reintentar = output<void>();
}
