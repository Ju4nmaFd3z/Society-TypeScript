import { Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  BotonComponent,
  CampoCristalComponent,
  CasillaComponent,
  ChipComponent,
  EstadoCargandoComponent,
  EstadoErrorComponent,
  EstadoVacioComponent,
  EtiquetaConfianzaComponent,
  EtiquetaEstadoComponent,
  EtiquetaOrigenComponent,
  TarjetaCristalComponent,
  type Confianza,
  type EstadoPieza,
  type Origen,
} from '../../shared/ui';

/**
 * Catálogo de los componentes de `shared/ui` (SOCIETY-54). Página pública, solo para
 * desarrollo y revisión: sirve de evidencia del hito H3 (componentes reutilizables).
 */
@Component({
  selector: 'app-catalogo',
  imports: [
    ReactiveFormsModule,
    BotonComponent,
    CampoCristalComponent,
    CasillaComponent,
    ChipComponent,
    EstadoCargandoComponent,
    EstadoErrorComponent,
    EstadoVacioComponent,
    EtiquetaConfianzaComponent,
    EtiquetaEstadoComponent,
    EtiquetaOrigenComponent,
    TarjetaCristalComponent,
  ],
  templateUrl: './catalogo.component.html',
})
export class CatalogoComponent {
  protected readonly origenes: readonly Origen[] = ['google', 'tu-web', 'ia', 'tu'];
  protected readonly confianzas: readonly Confianza[] = ['observado', 'estimado', 'hipotesis'];
  protected readonly estados: readonly EstadoPieza[] = ['prevista', 'publicada', 'generada', 'borrador'];

  protected readonly chipActivo = signal(true);
  protected readonly chipNeutro = signal(false);
  protected readonly reintentos = signal(0);

  protected readonly campo = new FormControl('', { nonNullable: true, validators: [Validators.required] });
  protected readonly campoConError = new FormControl('nombre@', { nonNullable: true, validators: [Validators.email] });
  protected readonly casilla = new FormControl(false, { nonNullable: true });
}
