import { Component, EventEmitter, Input, Output } from '@angular/core';

// Chip del sistema de diseño: activo (azul) o neutro (cristal)
@Component({
  selector: 'app-chip',
  template: `
    <button type="button" [class]="activo ? 'chip-activo' : 'chip cristal-claro'" (click)="pulsado.emit()">
      <ng-content></ng-content>
    </button>
  `,
})
export class ChipComponent {
  @Input() activo = false;

  // Avisa al padre de que lo han pulsado; el padre decide si se activa
  @Output() pulsado = new EventEmitter<void>();
}
