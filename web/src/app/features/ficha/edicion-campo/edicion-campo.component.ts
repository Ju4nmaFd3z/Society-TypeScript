import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { BotonComponent } from '../../../shared/ui/boton/boton.component';
import { CampoCristalComponent } from '../../../shared/ui/campo-cristal/campo-cristal.component';
import { CampoEditable, ValorCampo } from '../ficha-simulada.service';

const ETIQUETAS: Record<CampoEditable, string> = {
  nombre: 'Nombre del local',
  descripcionCorta: 'Descripción corta',
  tonos: 'Tonos',
  fraseEjemplo: 'Frase de ejemplo',
};

// M04 · Editar un campo de la ficha
@Component({
  selector: 'app-edicion-campo',
  imports: [ReactiveFormsModule, BotonComponent, CampoCristalComponent],
  templateUrl: './edicion-campo.component.html',
})
export class EdicionCampoComponent implements OnInit, AfterViewInit {
  @Input() campo: CampoEditable = 'nombre';
  @Input() valor: ValorCampo = '';
  @Input() guardando = false;
  @Input() error = '';

  @Output() guardar = new EventEmitter<ValorCampo>();
  @Output() cancelar = new EventEmitter<void>();

  intentado = false;

  formulario = new FormGroup({
    texto: new FormControl(''),
  });

  constructor(private elemento: ElementRef<HTMLElement>) {}

  // Los tonos se editan como una lista separada por comas
  ngOnInit(): void {
    this.formulario.setValue({ texto: Array.isArray(this.valor) ? this.valor.join(', ') : this.valor });
  }

  // Lleva el foco al campo al abrir, para escribir sin ratón
  ngAfterViewInit(): void {
    this.elemento.nativeElement.querySelector('input')?.focus();
  }

  @HostListener('document:keydown.escape')
  alPulsarEscape(): void {
    if (!this.guardando) {
      this.cancelar.emit();
    }
  }

  get etiqueta(): string {
    return ETIQUETAS[this.campo];
  }

  get ayuda(): string {
    return this.campo === 'tonos' ? 'Sepáralos con comas, hasta 5.' : '';
  }

  get errorTexto(): string {
    if (!this.intentado) return '';
    const texto = this.textoRecortado;
    if (this.campo === 'nombre') {
      if (!texto) return 'Escribe el nombre del local.';
      if (texto.length < 2) return 'El nombre necesita al menos 2 caracteres.';
      if (texto.length > 80) return 'El nombre no puede pasar de 80 caracteres.';
    }
    if (this.campo === 'descripcionCorta' && texto.length > 120) return 'La descripción no puede pasar de 120 caracteres.';
    if (this.campo === 'fraseEjemplo' && texto.length > 160) return 'La frase no puede pasar de 160 caracteres.';
    if (this.campo === 'tonos') {
      const tonos = this.tonos;
      if (tonos.length === 0) return 'Escribe al menos un tono.';
      if (tonos.length > 5) return 'Elige como mucho 5 tonos.';
      if (tonos.some((tono) => tono.length > 20)) return 'Cada tono puede tener hasta 20 caracteres.';
    }
    return '';
  }

  enviar(): void {
    if (this.guardando) {
      return;
    }
    this.intentado = true;
    if (this.errorTexto) {
      return;
    }
    this.guardar.emit(this.campo === 'tonos' ? this.tonos : this.textoRecortado);
  }

  private get textoRecortado(): string {
    return (this.formulario.controls.texto.value ?? '').trim();
  }

  private get tonos(): string[] {
    return this.textoRecortado
      .split(',')
      .map((tono) => tono.trim())
      .filter((tono) => tono !== '');
  }
}
