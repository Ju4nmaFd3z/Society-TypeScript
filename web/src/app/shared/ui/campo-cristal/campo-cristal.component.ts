import { Component, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

let siguienteId = 0;

/**
 * Campo de texto con etiqueta, ayuda y error. Funciona con formularios reactivos (`formControlName`).
 * Se puede proyectar una acción junto a la etiqueta con el atributo `campoAccion`
 * (por ejemplo, «Mostrar» en una contraseña).
 */
@Component({
  selector: 'app-campo-cristal',
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CampoCristalComponent), multi: true }],
  template: `
    <div class="mb-espacio-6 flex items-end justify-between gap-espacio-8">
      <label class="text-etiqueta-sobretitulo-11-5 uppercase text-texto-terciario" [for]="id">{{ etiqueta() }}</label>
      <ng-content select="[campoAccion]" />
    </div>
    <input
      class="campo-texto"
      [id]="id"
      [type]="tipo()"
      [placeholder]="marcador()"
      [attr.autocomplete]="autocompletar() || null"
      [attr.maxlength]="longitudMaxima()"
      [value]="valor()"
      [disabled]="deshabilitado()"
      [attr.aria-invalid]="error() ? true : null"
      [attr.aria-describedby]="descripcion()"
      (input)="escribir($event)"
      (blur)="alTocar()"
    />
    @if (error()) {
      <p class="mt-espacio-6 text-cuerpo-pequeno-11-5 text-alerta" [id]="id + '-error'" role="alert">{{ error() }}</p>
    } @else if (ayuda()) {
      <p class="mt-espacio-6 text-cuerpo-pequeno-11-5 text-texto-terciario" [id]="id + '-ayuda'">{{ ayuda() }}</p>
    }
  `,
})
export class CampoCristalComponent implements ControlValueAccessor {
  readonly etiqueta = input.required<string>();
  readonly tipo = input<'text' | 'email' | 'password'>('text');
  readonly marcador = input('');
  readonly ayuda = input('');
  readonly error = input('');
  readonly autocompletar = input('');
  readonly longitudMaxima = input<number | null>(null);

  protected readonly id = `campo-${siguienteId++}`;
  protected readonly valor = signal('');
  protected readonly deshabilitado = signal(false);

  private alCambiar: (valor: string) => void = () => {};
  protected alTocar: () => void = () => {};

  protected descripcion(): string | null {
    if (this.error()) return `${this.id}-error`;
    return this.ayuda() ? `${this.id}-ayuda` : null;
  }

  protected escribir(evento: Event): void {
    const valor = (evento.target as HTMLInputElement).value;
    this.valor.set(valor);
    this.alCambiar(valor);
  }

  writeValue(valor: string | null): void {
    this.valor.set(valor ?? '');
  }
  registerOnChange(fn: (valor: string) => void): void {
    this.alCambiar = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.alTocar = fn;
  }
  setDisabledState(deshabilitado: boolean): void {
    this.deshabilitado.set(deshabilitado);
  }
}
