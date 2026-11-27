import { Component, EventEmitter, Input, Output } from '@angular/core';
import { EtiquetaOrigenComponent } from '../../../shared/ui/etiqueta-origen/etiqueta-origen.component';
import { TarjetaCristalComponent } from '../../../shared/ui/tarjeta-cristal/tarjeta-cristal.component';
import { Origen } from '../ficha-simulada.service';

// Único sitio donde el origen de la API se traduce al de la etiqueta
const ETIQUETA_DE_ORIGEN: Record<Origen, 'google' | 'tu-web' | 'ia' | 'tu'> = {
  GOOGLE: 'google',
  WEB: 'tu-web',
  IA: 'ia',
  USUARIO: 'tu',
};

// Bloque de la ficha: título, de dónde sale el dato y, si se puede cambiar, el lápiz
@Component({
  selector: 'app-bloque-ficha',
  imports: [EtiquetaOrigenComponent, TarjetaCristalComponent],
  template: `
    <app-tarjeta-cristal>
      <div class="flex items-start justify-between gap-espacio-8">
        <div class="flex flex-col gap-espacio-6">
          <h2 class="text-etiqueta-sobretitulo-11-5 uppercase text-texto-terciario">{{ titulo }}</h2>
          <app-etiqueta-origen [origen]="etiquetaOrigen" />
        </div>
        @if (editable) {
          <button type="button" class="chip cristal-claro" [attr.aria-label]="'Editar ' + titulo.toLowerCase()" (click)="editar.emit()">
            <svg class="icono size-4" viewBox="0 0 24 24"><path d="M4 20l1-4L16 5l3 3L8 19z" /></svg>
          </button>
        }
      </div>
      <div class="mt-espacio-10">
        <ng-content></ng-content>
      </div>
    </app-tarjeta-cristal>
  `,
})
export class BloqueFichaComponent {
  @Input() titulo = '';
  @Input() origen: Origen = 'IA';
  @Input() editable = false;

  // El padre decide qué campo se abre en el modal
  @Output() editar = new EventEmitter<void>();

  get etiquetaOrigen(): 'google' | 'tu-web' | 'ia' | 'tu' {
    return ETIQUETA_DE_ORIGEN[this.origen];
  }
}
