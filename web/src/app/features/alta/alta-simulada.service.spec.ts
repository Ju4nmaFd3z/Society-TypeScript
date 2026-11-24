import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AltaSimuladaService, BusquedaRespuesta } from './alta-simulada.service';

// Ocho locales en Málaga y uno en Sevilla, para probar el filtro y las páginas de 6
const locales = {
  places: [
    ...Array.from({ length: 8 }, (_, i) => ({
      id: 'loc_' + i,
      displayName: { text: 'Bar ' + i },
      formattedAddress: 'Calle Larios ' + i + ', Málaga',
      photos: [{ name: 'https://picsum.photos/seed/' + i + '/800/600' }],
    })),
    { id: 'loc_sevilla', displayName: { text: 'Cafetería La Giralda' }, formattedAddress: 'Calle Sierpes 3, Sevilla' },
  ],
};

describe('AltaSimuladaService', () => {
  let alta: AltaSimuladaService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    alta = TestBed.inject(AltaSimuladaService);
    http = TestBed.inject(HttpTestingController);
  });

  function buscar(texto: string, pageToken?: string): BusquedaRespuesta | 'error' {
    let respuesta: BusquedaRespuesta | 'error' = 'error';
    alta.buscar(texto, pageToken).subscribe({ next: (r) => (respuesta = r), error: () => (respuesta = 'error') });
    http.expectOne('/datos/locales.json').flush(locales);
    tick(500);
    return respuesta;
  }

  it('busca por nombre sin distinguir mayúsculas y devuelve la forma del contrato', fakeAsync(() => {
    const respuesta = buscar('GIRALDA') as BusquedaRespuesta;
    expect(respuesta.resultados).toEqual([
      { placeId: 'loc_sevilla', nombre: 'Cafetería La Giralda', direccion: 'Calle Sierpes 3, Sevilla', valoracion: undefined, numResenas: undefined, fotos: undefined },
    ]);
    expect(respuesta.nextPageToken).toBeUndefined();
  }));

  it('busca por dirección y pagina de 6 en 6', fakeAsync(() => {
    const primera = buscar('málaga') as BusquedaRespuesta;
    expect(primera.resultados.length).toBe(6);
    expect(primera.resultados[0].fotos).toEqual([{ name: 'https://picsum.photos/seed/0/800/600', atribuciones: [] }]);
    expect(primera.nextPageToken).toBe('6');

    const segunda = buscar('málaga', primera.nextPageToken) as BusquedaRespuesta;
    expect(segunda.resultados.map((lugar) => lugar.placeId)).toEqual(['loc_6', 'loc_7']);
    expect(segunda.nextPageToken).toBeUndefined();
  }));

  it('falla si se busca «error»', fakeAsync(() => {
    expect(buscar('Error')).toBe('error');
  }));
});
