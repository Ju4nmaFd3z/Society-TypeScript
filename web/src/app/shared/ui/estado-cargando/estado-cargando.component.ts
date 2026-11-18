import { Component } from '@angular/core';

// Estado cargando: tres líneas grises que parpadean mientras llegan los datos
@Component({
  selector: 'app-estado-cargando',
  template: `
    <div class="flex flex-col gap-espacio-10">
      <span class="h-4 w-full animate-pulse rounded-chip bg-tinta/10"></span>
      <span class="h-4 w-full animate-pulse rounded-chip bg-tinta/10"></span>
      <span class="h-4 w-3/5 animate-pulse rounded-chip bg-tinta/10"></span>
    </div>
  `,
})
export class EstadoCargandoComponent {}
