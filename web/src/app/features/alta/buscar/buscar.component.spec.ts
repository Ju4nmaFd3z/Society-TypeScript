import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BuscarComponent } from './buscar.component';

const locales = {
  places: [
    {
      id: 'loc_001',
      displayName: { text: 'Bar El Boquerón Dorado' },
      formattedAddress: 'Calle Larios 12, Málaga',
      rating: 4.6,
      userRatingCount: 1280,
      photos: [{ name: 'https://picsum.photos/seed/boqueron1/800/600' }],
    },
  ],
};

describe('BuscarComponent', () => {
  let fixture: ComponentFixture<BuscarComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    fixture = TestBed.createComponent(BuscarComponent);
    fixture.detectChanges();
  });

  function buscar(texto: string): void {
    fixture.componentInstance.busqueda.controls.texto.setValue(texto);
    fixture.componentInstance.buscar();
    TestBed.inject(HttpTestingController).expectOne('/datos/locales.json').flush(locales);
    tick(500);
    fixture.detectChanges();
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
    expect(fixture.nativeElement.querySelector('img').src).toContain('boqueron1');
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
});
