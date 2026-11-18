import { Component, computed, model } from '@angular/core';

/**
 * Chip que se puede activar y desactivar. Activo: azul con texto blanco.
 * Neutro: cristal claro. El estado también se anuncia con `aria-pressed`.
 */
@Component({
  selector: 'app-chip',
  template: `
    <button type="button" [class]="clases()" [attr.aria-pressed]="activo()" (click)="alternar()">
      <ng-content />
    </button>
  `,
})
export class ChipComponent {
  readonly activo = model(false);

  protected readonly clases = computed(() => (this.activo() ? 'chip-activo' : 'chip cristal-claro'));

  protected alternar(): void {
    this.activo.update((valor) => !valor);
  }
}
