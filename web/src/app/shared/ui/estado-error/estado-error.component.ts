import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BotonComponent } from '../boton/boton.component';

// Estado de error: aviso y botón «Reintentar»
@Component({
  selector: 'app-estado-error',
  imports: [BotonComponent],
  template: `
    <div class="flex flex-col items-center gap-espacio-8 py-espacio-16 text-center">
      <h2 class="font-display text-titulo-cifra-22 text-tinta">{{ titulo }}</h2>
      <p class="text-cuerpo-intro-15 text-texto-secundario">{{ mensaje }}</p>
      <app-boton variante="secundario" (click)="reintentar.emit()">Reintentar</app-boton>
    </div>
  `,
})
export class EstadoErrorComponent {
  @Input() titulo = 'Revisa tu conexión';
  @Input() mensaje = 'No hemos podido cargar los datos.';

  // El padre decide qué se vuelve a intentar
  @Output() reintentar = new EventEmitter<void>();
}
