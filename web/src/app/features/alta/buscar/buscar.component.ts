import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { BotonComponent } from '../../../shared/ui/boton/boton.component';
import { CampoCristalComponent } from '../../../shared/ui/campo-cristal/campo-cristal.component';
import { CasillaComponent } from '../../../shared/ui/casilla/casilla.component';
import { EstadoCargandoComponent } from '../../../shared/ui/estado-cargando/estado-cargando.component';
import { EstadoErrorComponent } from '../../../shared/ui/estado-error/estado-error.component';
import { EstadoVacioComponent } from '../../../shared/ui/estado-vacio/estado-vacio.component';
import { TarjetaCristalComponent } from '../../../shared/ui/tarjeta-cristal/tarjeta-cristal.component';
import { AltaSimuladaService, LugarRespuesta, ResultadoAlta } from '../alta-simulada.service';

type Estado =
  | { tipo: 'inicial' }
  | { tipo: 'cargando' }
  | { tipo: 'vacio' }
  | { tipo: 'error' }
  | { tipo: 'conDatos'; resultados: LugarRespuesta[]; nextPageToken?: string; cargandoMas: boolean };

// S02 · Busca tu local (con datos simulados)
@Component({
  selector: 'app-buscar',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    BotonComponent,
    CampoCristalComponent,
    CasillaComponent,
    EstadoCargandoComponent,
    EstadoErrorComponent,
    EstadoVacioComponent,
    TarjetaCristalComponent,
  ],
  templateUrl: './buscar.component.html',
})
export class BuscarComponent {
  estado: Estado = { tipo: 'inicial' };
  elegido: LugarRespuesta | null = null;
  creando = false;
  mensajeAlta = '';

  busqueda = new FormGroup({
    texto: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]),
  });

  confirmacion = new FormGroup({
    declaraGestor: new FormControl(false),
  });

  // «Ver más» pide la página siguiente del mismo texto, aunque el buscador ya haya cambiado
  private textoBuscado = '';

  constructor(
    private alta: AltaSimuladaService,
    private router: Router,
  ) {}

  buscar(): void {
    const texto = (this.busqueda.controls.texto.value ?? '').trim();
    if (texto.length < 3 || texto.length > 100) {
      return;
    }

    this.textoBuscado = texto;
    this.elegido = null;
    this.estado = { tipo: 'cargando' };
    this.alta.buscar(texto).subscribe({
      next: (respuesta) => {
        this.estado =
          respuesta.resultados.length === 0
            ? { tipo: 'vacio' }
            : { tipo: 'conDatos', resultados: respuesta.resultados, nextPageToken: respuesta.nextPageToken, cargandoMas: false };
      },
      error: () => {
        this.estado = { tipo: 'error' };
      },
    });
  }

  // Paginación manual con nextPageToken (D-15): los nuevos se añaden al final
  verMas(): void {
    const estado = this.estado;
    if (estado.tipo !== 'conDatos' || !estado.nextPageToken || estado.cargandoMas) {
      return;
    }

    this.estado = { ...estado, cargandoMas: true };
    this.alta.buscar(this.textoBuscado, estado.nextPageToken).subscribe({
      next: (respuesta) => {
        this.estado = {
          tipo: 'conDatos',
          resultados: [...estado.resultados, ...respuesta.resultados],
          nextPageToken: respuesta.nextPageToken,
          cargandoMas: false,
        };
      },
      // Si falla la página siguiente se quedan las tarjetas que ya había
      error: () => {
        this.estado = { ...estado, cargandoMas: false };
      },
    });
  }

  elegir(lugar: LugarRespuesta): void {
    if (this.elegido?.placeId === lugar.placeId) {
      return;
    }
    this.elegido = lugar;
    this.confirmacion.reset({ declaraGestor: false });
    this.mensajeAlta = '';
  }

  esMiLocal(): void {
    if (!this.elegido || !this.confirmacion.controls.declaraGestor.value || this.creando) {
      return;
    }

    this.creando = true;
    this.mensajeAlta = '';
    this.alta.crear({ origen: 'GOOGLE', googlePlaceId: this.elegido.placeId, declaraGestor: true }).subscribe({
      next: (resultado) => this.trasCrear(resultado),
      error: () => this.trasCrear({ tipo: 'error' }),
    });
  }

  private trasCrear(resultado: ResultadoAlta): void {
    this.creando = false;
    if (resultado.tipo === 'creado') {
      this.router.navigateByUrl('/alta/analisis/' + resultado.id);
      return;
    }
    this.mensajeAlta =
      resultado.tipo === 'duplicado'
        ? 'Este local ya está dado de alta.'
        : 'No hemos podido dar de alta tu local. Inténtalo de nuevo.';
  }
}
