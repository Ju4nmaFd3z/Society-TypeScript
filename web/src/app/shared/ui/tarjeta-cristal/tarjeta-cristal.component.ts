import { Component, Input } from '@angular/core';

// Tarjeta de cristal: cuanto más texto lleva, más densa
@Component({
  selector: 'app-tarjeta-cristal',
  template: `
    <div [class]="clases">
      <ng-content></ng-content>
    </div>
  `,
})
export class TarjetaCristalComponent {
  @Input() densidad: 'claro' | 'estandar' | 'denso' = 'estandar';
  @Input() destacada = false;

  get clases(): string {
    const radio = this.destacada ? 'rounded-tarjeta-destacada' : 'rounded-tarjeta-y-campo';
    return 'cristal-' + this.densidad + ' p-espacio-16 ' + radio;
  }
}
