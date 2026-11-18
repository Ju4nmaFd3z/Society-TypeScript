import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SesionSimuladaService } from '../../core/sesion/sesion-simulada.service';
import { BotonComponent } from '../../shared/ui/boton/boton.component';
import { CampoCristalComponent } from '../../shared/ui/campo-cristal/campo-cristal.component';
import { CasillaComponent } from '../../shared/ui/casilla/casilla.component';
import { ChipComponent } from '../../shared/ui/chip/chip.component';
import { TarjetaCristalComponent } from '../../shared/ui/tarjeta-cristal/tarjeta-cristal.component';

// S01A · Acceso: crear cuenta o iniciar sesión (con la sesión simulada)
@Component({
  selector: 'app-acceso',
  imports: [
    ReactiveFormsModule,
    BotonComponent,
    CampoCristalComponent,
    CasillaComponent,
    ChipComponent,
    TarjetaCristalComponent,
  ],
  templateUrl: './acceso.component.html',
})
export class AccesoComponent {
  modo: 'crear' | 'entrar' = 'crear';
  verContrasena = false;
  intentado = false;
  mensajeError = '';

  formulario = new FormGroup({
    correo: new FormControl('', [Validators.required, Validators.email, Validators.maxLength(254)]),
    contrasena: new FormControl('', [Validators.required, Validators.minLength(8)]),
    terminos: new FormControl(false),
  });

  constructor(
    private sesion: SesionSimuladaService,
    private router: Router,
  ) {}

  cambiarModo(modo: 'crear' | 'entrar'): void {
    this.modo = modo;
    this.intentado = false;
    this.mensajeError = '';
  }

  // Los errores solo se enseñan si el campo se ha tocado o se ha pulsado «Continuar»
  get errorCorreo(): string {
    const correo = this.formulario.controls.correo;
    if (!correo.touched && !this.intentado) return '';
    if (correo.hasError('required')) return 'Escribe tu correo electrónico.';
    if (correo.hasError('maxlength')) return 'El correo no puede pasar de 254 caracteres.';
    if (correo.hasError('email')) return 'Escribe un correo válido, por ejemplo nombre@correo.es.';
    return '';
  }

  get errorContrasena(): string {
    const contrasena = this.formulario.controls.contrasena;
    if (!contrasena.touched && !this.intentado) return '';
    if (contrasena.hasError('required')) return 'Escribe tu contraseña.';
    if (contrasena.hasError('minlength')) return 'La contraseña necesita al menos 8 caracteres.';
    return '';
  }

  // Los términos solo son obligatorios al crear la cuenta
  get errorTerminos(): string {
    if (this.intentado && this.modo === 'crear' && !this.formulario.controls.terminos.value) {
      return 'Para crear la cuenta tienes que aceptar los términos y la política de privacidad.';
    }
    return '';
  }

  enviar(): void {
    this.intentado = true;
    this.mensajeError = '';

    if (this.formulario.invalid || this.errorTerminos) {
      return;
    }

    // La contraseña no se usa: la sesión simulada no la comprueba ni la guarda
    const correo = this.formulario.controls.correo.value ?? '';

    if (this.modo === 'crear') {
      if (!this.sesion.registrar(correo)) {
        this.cambiarModo('entrar');
        this.mensajeError = 'Ese correo ya tiene una cuenta. Inicia sesión.';
        return;
      }
    } else {
      if (!this.sesion.iniciarSesion(correo)) {
        this.mensajeError = 'El correo o la contraseña no son correctos.';
        return;
      }
    }

    this.router.navigateByUrl(this.sesion.rutaDeInicio());
  }
}
