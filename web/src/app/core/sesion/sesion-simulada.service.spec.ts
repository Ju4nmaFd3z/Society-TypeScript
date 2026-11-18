import { TestBed } from '@angular/core/testing';
import { SesionSimuladaService } from './sesion-simulada.service';

describe('SesionSimuladaService', () => {
  let sesion: SesionSimuladaService;

  beforeEach(() => {
    sesion = TestBed.inject(SesionSimuladaService);
  });

  it('la cuenta de ejemplo entra con el alta hecha y va al resumen', () => {
    expect(sesion.iniciarSesion('local@ejemplo.es')).toBeTrue();
    expect(sesion.haySesion()).toBeTrue();
    expect(sesion.rutaDeInicio()).toBe('/resumen');
  });

  it('una cuenta nueva entra con el alta pendiente y va a buscar el local', () => {
    expect(sesion.registrar('nuevo@ejemplo.es')).toBeTrue();
    expect(sesion.altaCompletada()).toBeFalse();
    expect(sesion.rutaDeInicio()).toBe('/alta/buscar');
  });

  it('un correo desconocido no entra', () => {
    expect(sesion.iniciarSesion('nadie@ejemplo.es')).toBeFalse();
    expect(sesion.haySesion()).toBeFalse();
  });
});
