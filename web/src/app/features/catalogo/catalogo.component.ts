import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { BotonComponent } from '../../shared/ui/boton/boton.component';
import { CampoCristalComponent } from '../../shared/ui/campo-cristal/campo-cristal.component';
import { CasillaComponent } from '../../shared/ui/casilla/casilla.component';
import { ChipComponent } from '../../shared/ui/chip/chip.component';
import { EstadoCargandoComponent } from '../../shared/ui/estado-cargando/estado-cargando.component';
import { EstadoErrorComponent } from '../../shared/ui/estado-error/estado-error.component';
import { EstadoVacioComponent } from '../../shared/ui/estado-vacio/estado-vacio.component';
import { EtiquetaConfianzaComponent } from '../../shared/ui/etiqueta-confianza/etiqueta-confianza.component';
import { EtiquetaEstadoComponent } from '../../shared/ui/etiqueta-estado/etiqueta-estado.component';
import { EtiquetaOrigenComponent } from '../../shared/ui/etiqueta-origen/etiqueta-origen.component';
import { TarjetaCristalComponent } from '../../shared/ui/tarjeta-cristal/tarjeta-cristal.component';

// Catálogo con todos los componentes de shared/ui (página pública para revisar el diseño)
@Component({
  selector: 'app-catalogo',
  imports: [
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
  // Controles de ejemplo para el campo y la casilla
  nombre = new FormControl('');
  correo = new FormControl('nombre@');
  propietario = new FormControl(false);

  // Qué chip está activo
  chipActivo = 1;

  // Cuántas veces se ha pulsado «Reintentar»
  reintentos = 0;
}
