import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { SesionSimuladaService } from '../../core/sesion/sesion-simulada.service';
import { Ficha } from './ficha-simulada.service';
import { FichaComponent } from './ficha.component';

function datos(cambios: Partial<Ficha> = {}) {
  const ficha: Ficha = {
    nombre: 'Bar El Boquerón Dorado',
    descripcionCorta: 'Pescaíto frito y tapas.',
    tonos: ['Cercano', 'Tradicional'],
    fraseEjemplo: '¿Te pongo una ración?',
    colores: [{ nombre: 'Dorado rótulo', hex: '#E3A72F', origen: 'GOOGLE', editado: false }],
    tipografias: [{ rol: 'TITULOS', familia: 'Playfair Display', coincidencia: 0.82, origen: 'WEB' }],
    canales: [{ tipo: 'WEB', valor: 'https://boqueron-dorado.es' }],
    origenPorCampo: {
      nombre: 'GOOGLE',
      descripcionCorta: 'IA',
      tonos: 'IA',
      fraseEjemplo: 'IA',
      colores: 'IA',
      tipografias: 'WEB',
      canales: 'GOOGLE',
    },
    version: 1,
    origenAlta: 'GOOGLE',
    ...cambios,
  };
  return { ficha, resumenGoogle: { valoracion: 4.6, numResenas: 1280 }, instagram: { conectado: false } };
}

describe('FichaComponent', () => {
  let fixture: ComponentFixture<FichaComponent>;

  beforeEach(() => {
    // Router con una ruta que lo acepta todo, para que la navegación no falle
    TestBed.configureTestingModule({
      providers: [provideRouter([{ path: '**', children: [] }]), provideHttpClient(), provideHttpClientTesting()],
    });
    fixture = TestBed.createComponent(FichaComponent);
    fixture.detectChanges();
  });

  // forkJoin pide la ficha, el resumen de Google y el estado de Instagram
  function responder(cambios: Partial<Ficha> = {}): void {
    TestBed.inject(HttpTestingController)
      .match('/datos/ficha.json')
      .forEach((peticion) => peticion.flush(datos(cambios)));
    tick(500);
    fixture.detectChanges();
  }

  function texto(): string {
    return fixture.nativeElement.textContent;
  }

  function boton(etiqueta: string): HTMLButtonElement {
    const botones: HTMLButtonElement[] = Array.from(fixture.nativeElement.querySelectorAll('button'));
    return botones.find((b) => b.getAttribute('aria-label') === etiqueta || b.textContent?.includes(etiqueta))!;
  }

  it('enseña los bloques con su origen, la valoración y lápiz solo en lo editable', fakeAsync(() => {
    responder();
    expect(texto()).toContain('Bar El Boquerón Dorado');
    expect(texto()).toContain('★ 4.6 · 1280 reseñas');
    expect(texto()).toContain('Google');
    expect(texto()).toContain('Conectar Instagram');
    expect(fixture.nativeElement.querySelectorAll('button[aria-label^="Editar"]').length).toBe(4);
  }));

  it('con el alta manual avisa en lugar de enseñar la valoración', fakeAsync(() => {
    responder({ origenAlta: 'MANUAL' });
    expect(texto()).toContain('Diste de alta tu local a mano');
    expect(texto()).not.toContain('★');
  }));

  it('edita el nombre, lo marca como tuyo, confirma y va al resumen', fakeAsync(() => {
    const sesion = TestBed.inject(SesionSimuladaService);
    sesion.registrar('nuevo@ejemplo.es');
    const navegar = spyOn(TestBed.inject(Router), 'navigateByUrl');
    responder();

    boton('Editar tu local').click();
    fixture.detectChanges();
    const dialogo: HTMLElement = fixture.nativeElement.querySelector('[role="dialog"]');
    expect(dialogo.getAttribute('aria-modal')).toBe('true');

    const campo: HTMLInputElement = dialogo.querySelector('input')!;
    campo.value = '  Bar El Boquerón  ';
    campo.dispatchEvent(new Event('input'));
    boton('Guardar').click();
    tick(500);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[role="dialog"]')).toBeNull();
    expect(texto()).toContain('Bar El Boquerón');
    expect(texto()).toContain('Tú');

    boton('Todo correcto, seguir').click();
    tick(500);
    expect(sesion.altaCompletada()).toBeTrue();
    expect(navegar).toHaveBeenCalledWith('/resumen', { replaceUrl: true });
  }));

  it('el modal no guarda un nombre de una letra', fakeAsync(() => {
    responder();
    boton('Editar tu local').click();
    fixture.detectChanges();

    const campo: HTMLInputElement = fixture.nativeElement.querySelector('[role="dialog"] input');
    campo.value = 'B';
    campo.dispatchEvent(new Event('input'));
    boton('Guardar').click();
    fixture.detectChanges();

    expect(texto()).toContain('El nombre necesita al menos 2 caracteres.');
  }));

  it('Escape cierra el modal sin guardar', fakeAsync(() => {
    responder();
    boton('Editar cómo hablas').click();
    fixture.detectChanges();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[role="dialog"]')).toBeNull();
  }));

  it('sin tonos no deja seguir', fakeAsync(() => {
    responder({ tonos: [] });
    expect(boton('Todo correcto, seguir').disabled).toBeTrue();
    expect(texto()).toContain('al menos un tono');
  }));

  it('si la carga falla enseña el error con «Reintentar»', fakeAsync(() => {
    // Con el primer fallo forkJoin cancela las otras dos peticiones
    TestBed.inject(HttpTestingController).match('/datos/ficha.json')[0].flush(null, { status: 500, statusText: 'Error' });
    tick(500);
    fixture.detectChanges();
    expect(texto()).toContain('Reintentar');
  }));
});
