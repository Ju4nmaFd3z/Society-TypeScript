import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

/**
 * PROVISIONAL: página de relleno para las secciones del panel.
 * cada vista real en `features/`, la sustituirá en su sprint.
 */
@Component({
  selector: 'app-pagina-vacia',
  template: `
    <section class="cristal-estandar rounded-tarjeta-y-campo p-espacio-16">
      <h1 class="font-display text-titulo-pantalla-24 text-tinta">{{ titulo }}</h1>
      <p class="mt-espacio-8 text-cuerpo-intro-15 text-texto-secundario">Esta sección todavía está vacía.</p>
    </section>
  `,
})
export class PaginaVaciaComponent {
  protected readonly titulo: string = inject(ActivatedRoute).snapshot.data['titulo'];
}
