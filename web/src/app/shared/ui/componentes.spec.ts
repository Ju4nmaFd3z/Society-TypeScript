import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
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
} from './index';

@Component({
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
  template: `
    <button id="primario" appBoton>Uno</button>
    <button id="secundario" appBoton variante="secundario">Dos</button>
    <app-campo-cristal id="campo" etiqueta="Nombre" ayuda="Ayuda" [error]="error()" [formControl]="texto" />
    <app-casilla id="casilla" [formControl]="marca">Acepto</app-casilla>
    <app-chip id="chip" [(activo)]="activo">Chip</app-chip>
    <app-etiqueta-origen id="origen" origen="ia" />
    <app-etiqueta-confianza id="confianza" confianza="estimado" />
    <app-etiqueta-estado id="estado" estado="publicada" />
    <app-tarjeta-cristal id="tarjeta" densidad="denso" [destacada]="true">x</app-tarjeta-cristal>
    <app-estado-cargando id="cargando" [lineas]="4" />
    <app-estado-vacio id="vacio" titulo="Nada" mensaje="Aún no hay nada." />
    <app-estado-error id="error" (reintentar)="reintentos.set(reintentos() + 1)" />
  `,
})
class AnfitrionComponent {
  readonly texto = new FormControl('');
  readonly marca = new FormControl(false);
  readonly activo = signal(false);
  readonly error = signal('');
  readonly reintentos = signal(0);
}

describe('Componentes de shared/ui', () => {
  let anfitrion: AnfitrionComponent;
  let raiz: HTMLElement;
  let fixture: ReturnType<typeof TestBed.createComponent<AnfitrionComponent>>;
  const q = (selector: string) => raiz.querySelector<HTMLElement>(selector)!;

  beforeEach(() => {
    fixture = TestBed.createComponent(AnfitrionComponent);
    anfitrion = fixture.componentInstance;
    raiz = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('botón primario y secundario llevan sus clases del sistema de diseño', () => {
    expect(q('#primario').classList).toContain('boton-primario');
    expect(q('#secundario').classList).toContain('boton-secundario');
    expect(q('#secundario').classList).toContain('cristal-claro');
  });

  it('el campo enlaza el formulario en los dos sentidos y enlaza etiqueta e input', () => {
    const input = q('#campo input') as HTMLInputElement;
    const etiqueta = q('#campo label') as HTMLLabelElement;
    expect(etiqueta.htmlFor).toBe(input.id);
    input.value = 'Bar';
    input.dispatchEvent(new Event('input'));
    expect(anfitrion.texto.value).toBe('Bar');
    anfitrion.texto.setValue('Taberna');
    fixture.detectChanges();
    expect(input.value).toBe('Taberna');
  });

  it('el campo muestra la ayuda y, con error, el error en su lugar con aria-invalid', () => {
    expect(q('#campo').textContent).toContain('Ayuda');
    anfitrion.error.set('Falta algo');
    fixture.detectChanges();
    expect(q('#campo').textContent).toContain('Falta algo');
    expect(q('#campo').textContent).not.toContain('Ayuda');
    expect(q('#campo input').getAttribute('aria-invalid')).toBe('true');
  });

  it('la casilla enlaza el formulario', () => {
    const input = q('#casilla input') as HTMLInputElement;
    input.checked = true;
    input.dispatchEvent(new Event('change'));
    expect(anfitrion.marca.value).toBeTrue();
  });

  it('el chip alterna y anuncia su estado con aria-pressed', () => {
    const boton = q('#chip button');
    expect(boton.getAttribute('aria-pressed')).toBe('false');
    boton.click();
    fixture.detectChanges();
    expect(anfitrion.activo()).toBeTrue();
    expect(boton.getAttribute('aria-pressed')).toBe('true');
    expect(boton.className).toContain('chip-activo');
  });

  it('las etiquetas muestran siempre la palabra, no solo el icono o el color', () => {
    expect(q('#origen').textContent).toContain('IA');
    expect(q('#confianza').textContent).toContain('Estimado');
    expect(q('#estado').textContent).toContain('Publicada');
  });

  it('la etiqueta de confianza rellena tantas barras como indica el nivel', () => {
    const barras = Array.from(q('#confianza').querySelectorAll('span[aria-hidden] > span'));
    expect(barras.length).toBe(3);
    expect(barras.filter((b) => b.classList.contains('bg-tinta')).length).toBe(2);
  });

  it('la tarjeta aplica densidad y radio', () => {
    expect(q('#tarjeta').classList).toContain('cristal-denso');
    expect(q('#tarjeta').classList).toContain('rounded-tarjeta-destacada');
  });

  it('cargando se anuncia con role="status" y pinta las líneas pedidas', () => {
    expect(q('#cargando [role=status]')).toBeTruthy();
    expect(q('#cargando').querySelectorAll('[role=status] > span').length).toBe(4);
  });

  it('vacío muestra título y mensaje', () => {
    expect(q('#vacio').textContent).toContain('Nada');
    expect(q('#vacio').textContent).toContain('Aún no hay nada.');
  });

  it('error muestra «Revisa tu conexión» y «Reintentar» emite el evento', () => {
    expect(q('#error').textContent).toContain('Revisa tu conexión');
    q('#error button').click();
    expect(anfitrion.reintentos()).toBe(1);
  });
});
