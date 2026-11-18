import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MotivoError, SesionSimuladaService } from '../../core/sesion/sesion-simulada.service';
import {
  BotonComponent,
  CampoCristalComponent,
  CasillaComponent,
  EstadoErrorComponent,
  TarjetaCristalComponent,
} from '../../shared/ui';

type Modo = 'crear' | 'entrar';
type NombreCampo = 'correo' | 'contrasena' | 'terminos';

const MENSAJES_CAMPO: Record<NombreCampo, Record<string, string>> = {
  correo: {
    required: 'Escribe tu correo electrónico.',
    email: 'Escribe un correo válido, por ejemplo nombre@correo.es.',
    maxlength: 'El correo no puede pasar de 254 caracteres.',
  },
  contrasena: {
    required: 'Escribe tu contraseña.',
    minlength: 'La contraseña necesita al menos 8 caracteres.',
  },
  terminos: {
    required: 'Para crear la cuenta tienes que aceptar los términos y la política de privacidad.',
  },
};

const MENSAJES_ERROR: Record<Exclude<MotivoError, 'sin-conexion'>, string> = {
  credenciales: 'El correo o la contraseña no son correctos.',
  'correo-registrado': 'Ese correo ya tiene una cuenta. Inicia sesión.',
  'demasiados-intentos': 'Demasiados intentos. Espera unos minutos y vuelve a probar.',
};

/**
 * S01A · Acceso: crear cuenta o iniciar sesión (docs/diseno/pantallas/01a-acceso.md).
 * PROVISIONAL (SOCIETY-55): usa `SesionSimuladaService`. Falta la mascota, el botón atrás
 * (en la web no existe 01 · Inicio) y «¿Olvidaste tu contraseña?», que es P1.
 */
@Component({
  selector: 'app-acceso',
  imports: [
    ReactiveFormsModule,
    BotonComponent,
    CampoCristalComponent,
    CasillaComponent,
    EstadoErrorComponent,
    TarjetaCristalComponent,
  ],
  templateUrl: './acceso.component.html',
})
export class AccesoComponent {
  private readonly sesion = inject(SesionSimuladaService);
  private readonly router = inject(Router);

  protected readonly modo = signal<Modo>('crear');
  protected readonly enviando = signal(false);
  protected readonly intentado = signal(false);
  protected readonly mostrarContrasena = signal(false);
  /** Mensaje de error del servidor (credenciales, correo ya registrado, demasiados intentos). */
  protected readonly errorServidor = signal('');
  protected readonly sinConexion = signal(false);

  protected readonly formulario = new FormGroup({
    correo: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email, Validators.maxLength(254)],
    }),
    contrasena: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(8)],
    }),
    terminos: new FormControl(false, { nonNullable: true, validators: [Validators.requiredTrue] }),
  });

  protected cambiarModo(modo: Modo): void {
    if (this.enviando() || modo === this.modo()) return;
    this.modo.set(modo);
    this.intentado.set(false);
    this.errorServidor.set('');
    this.sinConexion.set(false);
    const terminos = this.formulario.controls.terminos;
    if (modo === 'crear') {
      terminos.setValidators(Validators.requiredTrue);
    } else {
      terminos.clearValidators();
      terminos.setValue(false);
    }
    terminos.updateValueAndValidity();
  }

  /** Muestra el error de un campo solo cuando se ha tocado o se ha intentado enviar. */
  protected errorDe(nombre: NombreCampo): string {
    const control = this.formulario.controls[nombre];
    if (!control.errors || !(control.touched || this.intentado())) return '';
    // Prioridad: `maxlength` antes que `email`, porque Angular también da `email` a un correo de más de 254 caracteres.
    // `requiredTrue` informa como `required`.
    const clave = ['required', 'maxlength', 'minlength', 'email'].find((k) => k in control.errors!);
    return clave ? (MENSAJES_CAMPO[nombre][clave] ?? '') : '';
  }

  protected async enviar(): Promise<void> {
    if (this.enviando()) return;
    this.intentado.set(true);
    this.errorServidor.set('');
    this.sinConexion.set(false);
    if (this.formulario.invalid) return;

    this.enviando.set(true);
    // La contraseña no sale del formulario: el servicio simulado no la recibe ni la guarda.
    const { correo } = this.formulario.getRawValue();
    const resultado =
      this.modo() === 'crear' ? await this.sesion.registrar(correo) : await this.sesion.iniciarSesion(correo);
    this.enviando.set(false);

    if (resultado.ok) {
      await this.router.navigateByUrl(resultado.destino);
      return;
    }
    if (resultado.motivo === 'sin-conexion') {
      this.sinConexion.set(true);
      return;
    }
    this.errorServidor.set(MENSAJES_ERROR[resultado.motivo]);
    if (resultado.motivo === 'correo-registrado') {
      this.cambiarModo('entrar');
      this.errorServidor.set(MENSAJES_ERROR[resultado.motivo]);
    }
  }
}
