import { Component, computed, input } from '@angular/core';

export type DensidadCristal = 'claro' | 'estandar' | 'denso';

/**
 * Tarjeta de cristal. Cuanto más texto lleva, más densa debe ser.
 * `destacada` usa el radio de 22 px de las tarjetas destacadas.
 */
@Component({
  selector: 'app-tarjeta-cristal',
  template: '<ng-content />',
  host: { '[class]': 'clases()' },
})
export class TarjetaCristalComponent {
  readonly densidad = input<DensidadCristal>('estandar');
  readonly destacada = input(false);

  protected readonly clases = computed(
    () =>
      `block cristal-${this.densidad()} p-espacio-16 ` +
      (this.destacada() ? 'rounded-tarjeta-destacada' : 'rounded-tarjeta-y-campo'),
  );
}
