import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BotonComponent } from '../../../shared/ui/boton/boton.component';
import { CampoCristalComponent } from '../../../shared/ui/campo-cristal/campo-cristal.component';
import { EstadoCargandoComponent } from '../../../shared/ui/estado-cargando/estado-cargando.component';
import { EstadoErrorComponent } from '../../../shared/ui/estado-error/estado-error.component';
import { EstadoVacioComponent } from '../../../shared/ui/estado-vacio/estado-vacio.component';
import { TarjetaCristalComponent } from '../../../shared/ui/tarjeta-cristal/tarjeta-cristal.component';
import { AltaSimuladaService, LugarRespuesta } from '../alta-simulada.service';

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
    EstadoCargandoComponent,
    EstadoErrorComponent,
    EstadoVacioComponent,
    TarjetaCristalComponent,
  ],
  templateUrl: './buscar.component.html',
})
export class BuscarComponent {
  estado: Estado = { tipo: 'inicial' };

  busqueda = new FormGroup({
    texto: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]),
  });

  constructor(private alta: AltaSimuladaService) {}

  buscar(): void {
    const texto = (this.busqueda.controls.texto.value ?? '').trim();
    if (texto.length < 3 || texto.length > 100) {
      return;
    }

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
}
