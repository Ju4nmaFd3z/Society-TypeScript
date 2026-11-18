import { Component, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

let siguienteId = 0;

/** Casilla con su texto. Funciona con formularios reactivos (`formControlName`). */
@Component({
  selector: 'app-casilla',
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CasillaComponent), multi: true }],
  template: `
    <label class="flex cursor-pointer items-start gap-espacio-10 text-cuerpo-secundario-12-5 text-texto-secundario" [for]="id">
      <input
        type="checkbox"
        class="mt-0.5 size-5 shrink-0 cursor-pointer accent-azul"
        [id]="id"
        [checked]="marcada()"
        [disabled]="deshabilitada()"
        [attr.aria-invalid]="error() ? true : null"
        [attr.aria-describedby]="error() ? id + '-error' : null"
        (change)="cambiar($event)"
        (blur)="alTocar()"
      />
      <span><ng-content /></span>
    </label>
    @if (error()) {
      <p class="mt-espacio-6 text-cuerpo-pequeno-11-5 text-alerta" [id]="id + '-error'" role="alert">{{ error() }}</p>
    }
  `,
})
export class CasillaComponent implements ControlValueAccessor {
  readonly error = input('');

  protected readonly id = `casilla-${siguienteId++}`;
  protected readonly marcada = signal(false);
  protected readonly deshabilitada = signal(false);

  private alCambiar: (valor: boolean) => void = () => {};
  protected alTocar: () => void = () => {};

  protected cambiar(evento: Event): void {
    const valor = (evento.target as HTMLInputElement).checked;
    this.marcada.set(valor);
    this.alCambiar(valor);
  }

  writeValue(valor: boolean | null): void {
    this.marcada.set(!!valor);
  }
  registerOnChange(fn: (valor: boolean) => void): void {
    this.alCambiar = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.alTocar = fn;
  }
  setDisabledState(deshabilitado: boolean): void {
    this.deshabilitada.set(deshabilitado);
  }
}
