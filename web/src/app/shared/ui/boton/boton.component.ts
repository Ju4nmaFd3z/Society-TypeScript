import { Component, computed, input } from '@angular/core';

export type VarianteBoton = 'primario' | 'secundario';

/**
 * Botón del sistema de diseño. Se usa sobre un `<button>` o un `<a>`:
 * `<button appBoton variante="secundario">Cancelar</button>`.
 * El primario es amarillo; el secundario es cristal claro.
 * Dentro de un formulario, indica siempre `type="button"` o `type="submit"`.
 */
@Component({
  selector: 'button[appBoton], a[appBoton]',
  template: '<ng-content />',
  host: { '[class]': 'clases()' },
})
export class BotonComponent {
  readonly variante = input<VarianteBoton>('primario');

  protected readonly clases = computed(() =>
    this.variante() === 'primario' ? 'boton-primario' : 'boton-secundario cristal-claro',
  );
}
