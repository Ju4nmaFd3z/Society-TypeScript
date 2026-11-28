import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Ficha, FichaSimuladaService, ResultadoGuardar, ResumenGoogle } from './ficha-simulada.service';

function datos(origenAlta: 'GOOGLE' | 'MANUAL' = 'GOOGLE') {
  const ficha: Ficha = {
    nombre: 'Bar El Boquerón Dorado',
    descripcionCorta: 'Pescaíto frito y tapas.',
    tonos: ['Cercano'],
    fraseEjemplo: '¿Te pongo una ración?',
    colores: [],
    tipografias: [],
    canales: [],
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
    origenAlta,
  };
  return { ficha, resumenGoogle: { valoracion: 4.6, numResenas: 1280 }, instagram: { conectado: false } };
}

describe('FichaSimuladaService', () => {
  let fichas: FichaSimuladaService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    fichas = TestBed.inject(FichaSimuladaService);
    http = TestBed.inject(HttpTestingController);
  });

  function obtener(): Ficha | undefined {
    let ficha: Ficha | undefined;
    fichas.obtener().subscribe((f) => (ficha = f));
    http.expectOne('/datos/ficha.json').flush(datos());
    tick(500);
    return ficha;
  }

  function guardarCampo(version: number): ResultadoGuardar | undefined {
    let resultado: ResultadoGuardar | undefined;
    fichas.guardarCampo('nombre', 'Bar El Boquerón', version).subscribe((r) => (resultado = r));
    tick(500);
    return resultado;
  }

  it('guarda el campo con origen USUARIO y sube la version', fakeAsync(() => {
    obtener();
    const resultado = guardarCampo(1);
    expect(resultado?.tipo).toBe('guardada');
    if (resultado?.tipo === 'guardada') {
      expect(resultado.ficha.nombre).toBe('Bar El Boquerón');
      expect(resultado.ficha.origenPorCampo.nombre).toBe('USUARIO');
      expect(resultado.ficha.version).toBe(2);
    }
    expect(obtener()?.nombre).toBe('Bar El Boquerón');
  }));

  it('con una version antigua es conflicto', fakeAsync(() => {
    obtener();
    guardarCampo(1);
    expect(guardarCampo(1)).toEqual({ tipo: 'conflicto' });
  }));

  it('el resumen de Google es null si el alta fue manual', fakeAsync(() => {
    let resumen: ResumenGoogle | null | undefined;
    fichas.resumenGoogle().subscribe((r) => (resumen = r));
    http.expectOne('/datos/ficha.json').flush(datos('MANUAL'));
    tick(500);
    expect(resumen).toBeNull();
  }));

  it('confirma la ficha', fakeAsync(() => {
    obtener();
    let tipo = '';
    fichas.confirmar().subscribe((r) => (tipo = r.tipo));
    tick(500);
    expect(tipo).toBe('confirmada');
  }));
});
