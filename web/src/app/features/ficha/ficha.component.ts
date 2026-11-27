import { Component, OnInit } from '@angular/core';
import { PercentPipe } from '@angular/common';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { SesionSimuladaService } from '../../core/sesion/sesion-simulada.service';
import { BotonComponent } from '../../shared/ui/boton/boton.component';
import { EstadoCargandoComponent } from '../../shared/ui/estado-cargando/estado-cargando.component';
import { EstadoErrorComponent } from '../../shared/ui/estado-error/estado-error.component';
import { BloqueFichaComponent } from './bloque-ficha/bloque-ficha.component';
import { EdicionCampoComponent } from './edicion-campo/edicion-campo.component';
import {
  CampoEditable,
  Canal,
  EstadoInstagram,
  Ficha,
  FichaSimuladaService,
  ResultadoConfirmar,
  ResultadoGuardar,
  ResumenGoogle,
  ValorCampo,
} from './ficha-simulada.service';

type Estado =
  | { tipo: 'cargando' }
  | { tipo: 'error' }
  | { tipo: 'conDatos'; ficha: Ficha; resumenGoogle: ResumenGoogle | null; instagram: EstadoInstagram };

const NOMBRE_DE_CANAL: Record<Canal['tipo'], string> = {
  WEB: 'Web',
  TELEFONO: 'Teléfono',
  INSTAGRAM: 'Instagram',
};

// S04 · Así te ve internet (con la ficha simulada)
@Component({
  selector: 'app-ficha',
  imports: [PercentPipe, BotonComponent, EstadoCargandoComponent, EstadoErrorComponent, BloqueFichaComponent, EdicionCampoComponent],
  templateUrl: './ficha.component.html',
})
export class FichaComponent implements OnInit {
  estado: Estado = { tipo: 'cargando' };
  editando: CampoEditable | null = null;
  guardando = false;
  errorEdicion = '';
  confirmando = false;
  mensajeConfirmar = '';

  nombreDeCanal = NOMBRE_DE_CANAL;

  constructor(
    private fichas: FichaSimuladaService,
    private sesion: SesionSimuladaService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.estado = { tipo: 'cargando' };
    forkJoin({
      ficha: this.fichas.obtener(),
      resumenGoogle: this.fichas.resumenGoogle(),
      instagram: this.fichas.instagram(),
    }).subscribe({
      next: (datos) => {
        this.estado = { tipo: 'conDatos', ...datos };
      },
      error: () => {
        this.estado = { tipo: 'error' };
      },
    });
  }

  editar(campo: CampoEditable): void {
    this.editando = campo;
    this.errorEdicion = '';
  }

  cancelarEdicion(): void {
    if (!this.guardando) {
      this.editando = null;
    }
  }

  guardarCampo(valor: ValorCampo): void {
    if (this.estado.tipo !== 'conDatos' || !this.editando || this.guardando) {
      return;
    }

    this.guardando = true;
    this.errorEdicion = '';
    this.fichas.guardarCampo(this.editando, valor, this.estado.ficha.version).subscribe({
      next: (resultado) => this.trasGuardar(resultado),
      error: () => this.trasGuardar({ tipo: 'error' }),
    });
  }

  // «Todo correcto, seguir» necesita al menos el nombre y un tono
  get puedeConfirmar(): boolean {
    return this.estado.tipo === 'conDatos' && this.estado.ficha.nombre.trim() !== '' && this.estado.ficha.tonos.length > 0;
  }

  confirmar(): void {
    if (!this.puedeConfirmar || this.confirmando) {
      return;
    }

    this.confirmando = true;
    this.mensajeConfirmar = '';
    this.fichas.confirmar().subscribe({
      next: (resultado) => this.trasConfirmar(resultado),
      error: () => this.trasConfirmar({ tipo: 'error' }),
    });
  }

  private trasGuardar(resultado: ResultadoGuardar): void {
    this.guardando = false;
    if (resultado.tipo === 'guardada' && this.estado.tipo === 'conDatos') {
      this.estado = { ...this.estado, ficha: resultado.ficha };
      this.editando = null;
      return;
    }
    this.errorEdicion =
      resultado.tipo === 'conflicto'
        ? 'Tu ficha ha cambiado mientras la editabas. Recarga la página para ver la última versión.'
        : 'No hemos podido guardar el cambio. Inténtalo de nuevo.';
  }

  private trasConfirmar(resultado: ResultadoConfirmar): void {
    this.confirmando = false;
    if (resultado.tipo === 'confirmada') {
      this.sesion.completarAlta();
      // replaceUrl para que «Atrás» no vuelva a la ficha ya confirmada
      this.router.navigateByUrl('/resumen', { replaceUrl: true });
      return;
    }
    this.mensajeConfirmar = 'No hemos podido confirmar tu ficha. Inténtalo de nuevo.';
  }
}
