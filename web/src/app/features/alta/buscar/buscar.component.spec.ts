import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { SesionSimuladaService } from '../../../core/sesion/sesion-simulada.service';
import { BuscarComponent } from './buscar.component';

// Ocho locales en Málaga: llenan una página de 6 y dejan 2 para «Ver más»
const locales = {
  places: Array.from({ length: 8 }, (_, i) => ({
    id: 'loc_' + i,
    displayName: { text: i === 0 ? 'Bar El Boquerón Dorado' : 'Bar ' + i },
    formattedAddress: 'Calle Larios ' + i + ', Málaga',
    rating: 4.6,
    userRatingCount: 1280,
    photos: [{ name: 'https://picsum.photos/seed/boqueron' + i + '/800/600' }],
  })),
};

describe('BuscarComponent', () => {
  let fixture: ComponentFixture<BuscarComponent>;

  beforeEach(() => {
    // Router con una ruta que lo acepta todo, para que la navegación no falle
    TestBed.configureTestingModule({
      providers: [provideRouter([{ path: '**', children: [] }]), provideHttpClient(), provideHttpClientTesting()],
    });
    fixture = TestBed.createComponent(BuscarComponent);
    fixture.detectChanges();
  });

  function responder(): void {
    TestBed.inject(HttpTestingController).expectOne('/datos/locales.json').flush(locales);
    tick(500);
    fixture.detectChanges();
  }

  function buscar(texto: string): void {
    fixture.componentInstance.busqueda.controls.texto.setValue(texto);
    fixture.componentInstance.buscar();
    responder();
  }

  function botonCon(texto: string): HTMLButtonElement {
    const botones: HTMLButtonElement[] = Array.from(fixture.nativeElement.querySelectorAll('button'));
    return botones.find((boton) => boton.textContent?.includes(texto))!;
  }

  it('con menos de 3 caracteres el botón de buscar está desactivado', () => {
    fixture.componentInstance.busqueda.controls.texto.setValue('ba');
    fixture.detectChanges();
    const boton: HTMLButtonElement = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(boton.disabled).toBeTrue();
  });

  it('enseña las tarjetas y el resumen de resultados', fakeAsync(() => {
    buscar('  boquerón  ');
    const texto: string = fixture.nativeElement.textContent;
    expect(texto).toContain('1 resultado en Google Maps');
    expect(texto).toContain('Bar El Boquerón Dorado');
    expect(texto).toContain('★ 4.6 · 1280 reseñas');
    expect(fixture.nativeElement.querySelector('img').src).toContain('boqueron0');
  }));

  it('sin resultados enseña «No encontramos tu local»', fakeAsync(() => {
    buscar('Sevilla');
    expect(fixture.nativeElement.textContent).toContain('No encontramos tu local');
  }));

  it('si la búsqueda falla enseña el error con «Reintentar»', fakeAsync(() => {
    buscar('error');
    const texto: string = fixture.nativeElement.textContent;
    expect(texto).toContain('Revisa tu conexión');
    expect(texto).toContain('Reintentar');
  }));

  it('«Ver más resultados» añade la página siguiente al final y desaparece al acabar', fakeAsync(() => {
    buscar('Málaga');
    expect(fixture.nativeElement.querySelectorAll('app-tarjeta-cristal').length).toBe(6);

    fixture.componentInstance.verMas();
    responder();

    expect(fixture.nativeElement.querySelectorAll('app-tarjeta-cristal').length).toBe(8);
    expect(fixture.nativeElement.textContent).toContain('8 resultados en Google Maps');
    expect(fixture.nativeElement.textContent).not.toContain('Ver más resultados');
  }));

  it('al elegir una tarjeta pide la casilla y luego va al análisis', fakeAsync(() => {
    TestBed.inject(SesionSimuladaService).registrar('nuevo@ejemplo.es');
    const navegar = spyOn(TestBed.inject(Router), 'navigateByUrl');
    buscar('boquerón');

    botonCon('Bar El Boquerón Dorado').click();
    fixture.detectChanges();
    expect(botonCon('Es mi local').disabled).toBeTrue();

    fixture.componentInstance.confirmacion.controls.declaraGestor.setValue(true);
    fixture.detectChanges();
    expect(botonCon('Es mi local').disabled).toBeFalse();

    fixture.componentInstance.esMiLocal();
    tick(500);
    expect(navegar.calls.mostRecent().args[0]).toMatch(/^\/alta\/analisis\/.+/);
  }));

  it('si el local ya está dado de alta lo avisa', fakeAsync(() => {
    TestBed.inject(SesionSimuladaService).iniciarSesion('local@ejemplo.es');
    buscar('boquerón');

    botonCon('Bar El Boquerón Dorado').click();
    fixture.componentInstance.confirmacion.controls.declaraGestor.setValue(true);
    fixture.componentInstance.esMiLocal();
    tick(500);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Este local ya está dado de alta');
  }));
});
