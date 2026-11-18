import { Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

let contador = 0;

// Campo de texto con etiqueta, ayuda y error; recibe su FormControl del formulario padre
@Component({
  selector: 'app-campo-cristal',
  imports: [ReactiveFormsModule],
  template: `
    <label [for]="id" class="mb-espacio-6 block text-etiqueta-sobretitulo-11-5 uppercase text-texto-terciario">
      {{ etiqueta }}
    </label>
    <input [id]="id" class="campo-texto" [type]="tipo" [placeholder]="marcador" [formControl]="control" />

    @if (error) {
      <p class="mt-espacio-6 text-cuerpo-pequeno-11-5 text-alerta">{{ error }}</p>
    } @else if (ayuda) {
      <p class="mt-espacio-6 text-cuerpo-pequeno-11-5 text-texto-terciario">{{ ayuda }}</p>
    }
  `,
})
export class CampoCristalComponent {
  @Input() etiqueta = '';
  @Input() tipo = 'text';
  @Input() marcador = '';
  @Input() ayuda = '';
  @Input() error = '';
  @Input() control = new FormControl('');

  // Cada campo tiene su id para que la etiqueta apunte a su input
  id = 'campo-' + contador++;
}
