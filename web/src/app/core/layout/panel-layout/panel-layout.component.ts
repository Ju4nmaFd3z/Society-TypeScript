import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NAVEGACION_PANEL } from '../navegacion-panel';

/**
 * Marco del panel web: cabecera, barra lateral y área de contenido.
 * Las páginas se pintan en el `router-outlet` del área de contenido.
 */
@Component({
  selector: 'app-panel-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './panel-layout.component.html',
})
export class PanelLayoutComponent {
  protected readonly navegacion = NAVEGACION_PANEL;

  // PROVISIONAL: datos de ejemplo (D-37). Los sustituirá un store cuando exista la API.
  protected readonly nombreLocal = signal('Bar El Boquerón Dorado');
  protected readonly cuenta = signal('Cuenta de ejemplo');

  protected readonly inicialCuenta = () => this.cuenta().charAt(0).toUpperCase();
}
