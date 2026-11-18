import { Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

// Casilla con su texto y su error; recibe su FormControl del formulario padre
@Component({
  selector: 'app-casilla',
  imports: [ReactiveFormsModule],
  template: `
    <label class="flex cursor-pointer items-start gap-espacio-10 text-cuerpo-secundario-12-5 text-texto-secundario">
      <input type="checkbox" class="mt-0.5 size-5 accent-azul" [formControl]="control" />
      <span><ng-content></ng-content></span>
    </label>

    @if (error) {
      <p class="mt-espacio-6 text-cuerpo-pequeno-11-5 text-alerta">{{ error }}</p>
    }
  `,
})
export class CasillaComponent {
  @Input() error = '';
  @Input() control = new FormControl(false);
}
