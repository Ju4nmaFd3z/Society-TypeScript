import { Component, Input } from '@angular/core';

// Botón del sistema de diseño: primario (amarillo) o secundario (cristal)
@Component({
  selector: 'app-boton',
  template: `
    <button [type]="tipo" [disabled]="deshabilitado" [class]="clases">
      <ng-content></ng-content>
    </button>
  `,
})
export class BotonComponent {
  @Input() variante: 'primario' | 'secundario' = 'primario';
  @Input() tipo: 'button' | 'submit' = 'button';
  @Input() deshabilitado = false;
  @Input() anchoCompleto = false;

  // Clases según la variante y el ancho
  get clases(): string {
    let clases = this.variante === 'primario' ? 'boton-primario' : 'boton-secundario cristal-claro';
    if (this.anchoCompleto) {
      clases += ' w-full';
    }
    return clases;
  }
}
