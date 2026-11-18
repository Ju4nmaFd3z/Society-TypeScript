import { Component, input } from '@angular/core';

/** Estado cargando: esqueleto con líneas. Se anuncia a los lectores de pantalla con `role="status"`. */
@Component({
  selector: 'app-estado-cargando',
  template: `
    <div role="status" aria-live="polite" [attr.aria-label]="mensaje()" class="flex flex-col gap-espacio-10">
      @for (linea of lineasArray(); track linea) {
        <span class="h-4 animate-pulse rounded-chip bg-tinta/10" [style.width.%]="linea % 3 === 0 ? 60 : 100"></span>
      }
    </div>
  `,
})
export class EstadoCargandoComponent {
  readonly lineas = input(3);
  readonly mensaje = input('Cargando');

  protected lineasArray(): number[] {
    return Array.from({ length: this.lineas() }, (_, i) => i + 1);
  }
}
