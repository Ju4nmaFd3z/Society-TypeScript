import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { BotonComponent } from '../../../shared/ui/boton/boton.component';
import { CampoCristalComponent } from '../../../shared/ui/campo-cristal/campo-cristal.component';
import { CasillaComponent } from '../../../shared/ui/casilla/casilla.component';
import { ChipComponent } from '../../../shared/ui/chip/chip.component';
import { TarjetaCristalComponent } from '../../../shared/ui/tarjeta-cristal/tarjeta-cristal.component';
import { AltaSimuladaService, ResultadoAlta, TipoLocal } from '../alta-simulada.service';

// S02M · Alta manual, para el local que no aparece en Google Maps (con el alta simulada)
@Component({
  selector: 'app-manual',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    BotonComponent,
    CampoCristalComponent,
    CasillaComponent,
    ChipComponent,
    TarjetaCristalComponent,
  ],
  templateUrl: './manual.component.html',
})
export class ManualComponent {
  intentado = false;
  guardando = false;
  mensajeError = '';

  tipos: { valor: TipoLocal; etiqueta: string }[] = [
    { valor: 'RESTAURANTE', etiqueta: 'Restaurante' },
    { valor: 'BAR', etiqueta: 'Bar' },
    { valor: 'CAFETERIA', etiqueta: 'Cafetería' },
    { valor: 'OTRO', etiqueta: 'Otro' },
  ];

  formulario = new FormGroup({
    nombre: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]),
    tipo: new FormControl<TipoLocal | null>(null, Validators.required),
    direccion: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(120)]),
    municipio: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(60)]),
    web: new FormControl('', Validators.pattern(/^https:\/\/[^\s/]+\.[^\s]+$/)),
    // Admite la arroba y las mayúsculas mientras se escribe; al guardar se quitan
    instagram: new FormControl('', Validators.pattern(/^@?[a-zA-Z0-9._]{1,30}$/)),
    declaraGestor: new FormControl(false),
  });

  constructor(
    private alta: AltaSimuladaService,
    private router: Router,
  ) {}

  // Los errores solo se enseñan si el campo se ha tocado o se ha pulsado «Guardar y analizar»
  get errorNombre(): string {
    const nombre = this.formulario.controls.nombre;
    if (!nombre.touched && !this.intentado) return '';
    if (nombre.hasError('required')) return 'Escribe el nombre del local.';
    if (nombre.hasError('minlength')) return 'El nombre necesita al menos 2 caracteres.';
    if (nombre.hasError('maxlength')) return 'El nombre no puede pasar de 80 caracteres.';
    return '';
  }

  get errorTipo(): string {
    return this.intentado && this.formulario.controls.tipo.invalid ? 'Elige el tipo de local.' : '';
  }

  get errorDireccion(): string {
    const direccion = this.formulario.controls.direccion;
    if (!direccion.touched && !this.intentado) return '';
    if (direccion.hasError('required')) return 'Escribe la dirección.';
    if (direccion.hasError('minlength')) return 'La dirección necesita al menos 3 caracteres.';
    if (direccion.hasError('maxlength')) return 'La dirección no puede pasar de 120 caracteres.';
    return '';
  }

  get errorMunicipio(): string {
    const municipio = this.formulario.controls.municipio;
    if (!municipio.touched && !this.intentado) return '';
    if (municipio.hasError('required')) return 'Escribe el municipio.';
    if (municipio.hasError('minlength')) return 'El municipio necesita al menos 2 caracteres.';
    if (municipio.hasError('maxlength')) return 'El municipio no puede pasar de 60 caracteres.';
    return '';
  }

  get errorWeb(): string {
    const web = this.formulario.controls.web;
    if (!web.touched && !this.intentado) return '';
    if (web.hasError('pattern')) return 'Escribe una web que empiece por https://, por ejemplo https://milocal.es.';
    return '';
  }

  get errorInstagram(): string {
    const instagram = this.formulario.controls.instagram;
    if (!instagram.touched && !this.intentado) return '';
    if (instagram.hasError('pattern')) return 'Usa solo letras, números, puntos o guiones bajos, hasta 30.';
    return '';
  }

  get errorDeclaraGestor(): string {
    if (this.intentado && !this.formulario.controls.declaraGestor.value) {
      return 'Para dar de alta el local tienes que declarar que lo gestionas.';
    }
    return '';
  }

  elegirTipo(tipo: TipoLocal): void {
    this.formulario.controls.tipo.setValue(tipo);
  }

  guardar(): void {
    if (this.guardando) {
      return;
    }
    this.intentado = true;
    this.mensajeError = '';

    // Se recorta antes de validar para que los espacios no cuenten en los límites
    const valores = this.formulario.getRawValue();
    this.formulario.patchValue({
      nombre: (valores.nombre ?? '').trim(),
      direccion: (valores.direccion ?? '').trim(),
      municipio: (valores.municipio ?? '').trim(),
      web: (valores.web ?? '').trim(),
      instagram: (valores.instagram ?? '').trim().replace(/^@/, '').toLowerCase(),
    });

    if (this.formulario.invalid || this.errorDeclaraGestor) {
      return;
    }

    const local = this.formulario.getRawValue();
    this.guardando = true;
    this.alta
      .crear({
        origen: 'MANUAL',
        nombre: local.nombre ?? '',
        direccion: local.direccion ?? '',
        municipio: local.municipio ?? '',
        tipo: local.tipo ?? 'OTRO',
        web: local.web || undefined,
        instagram: local.instagram || undefined,
        declaraGestor: true,
      })
      .subscribe({
        next: (resultado) => this.trasGuardar(resultado),
        error: () => this.trasGuardar({ tipo: 'error' }),
      });
  }

  private trasGuardar(resultado: ResultadoAlta): void {
    this.guardando = false;
    if (resultado.tipo === 'creado') {
      this.router.navigateByUrl('/alta/analisis/' + resultado.id);
      return;
    }
    this.mensajeError =
      resultado.tipo === 'duplicado' ? 'Ya tienes un local.' : 'No hemos podido guardar tu local. Inténtalo de nuevo.';
  }
}
