import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { CORREO_DE_EJEMPLO, ResultadoAcceso, SesionSimuladaService } from './sesion-simulada.service';

describe('SesionSimuladaService', () => {
  let servicio: SesionSimuladaService;

  /** Espera la respuesta simulada y la devuelve. */
  function resolver(promesa: Promise<ResultadoAcceso>): ResultadoAcceso {
    let resultado!: ResultadoAcceso;
    promesa.then((r) => (resultado = r));
    tick(400);
    return resultado;
  }

  beforeEach(() => {
    TestBed.configureTestingModule({});
    servicio = TestBed.inject(SesionSimuladaService);
  });

  it('empieza sin sesión', () => {
    expect(servicio.autenticada()).toBeFalse();
    expect(servicio.altaCompletada()).toBeFalse();
  });

  it('la cuenta de ejemplo entra con el alta completada y va al resumen', fakeAsync(() => {
    const resultado = resolver(servicio.iniciarSesion(CORREO_DE_EJEMPLO));
    expect(resultado).toEqual({ ok: true, destino: '/resumen' });
    expect(servicio.autenticada()).toBeTrue();
    expect(servicio.altaCompletada()).toBeTrue();
  }));

  it('una cuenta nueva queda con el alta pendiente y va a buscar el local', fakeAsync(() => {
    const resultado = resolver(servicio.registrar('nuevo@ejemplo.es'));
    expect(resultado).toEqual({ ok: true, destino: '/alta/buscar' });
    expect(servicio.altaCompletada()).toBeFalse();
    servicio.completarAlta();
    expect(servicio.altaCompletada()).toBeTrue();
  }));

  it('registrar un correo que ya existe da «correo-registrado» y no abre sesión', fakeAsync(() => {
    const resultado = resolver(servicio.registrar('LOCAL@ejemplo.es '));
    expect(resultado).toEqual({ ok: false, motivo: 'correo-registrado' });
    expect(servicio.autenticada()).toBeFalse();
  }));

  it('un correo desconocido da «credenciales» y a los 5 fallos bloquea con «demasiados-intentos»', fakeAsync(() => {
    for (let i = 0; i < 5; i++) {
      expect(resolver(servicio.iniciarSesion('nadie@ejemplo.es'))).toEqual({ ok: false, motivo: 'credenciales' });
    }
    expect(resolver(servicio.iniciarSesion('nadie@ejemplo.es'))).toEqual({ ok: false, motivo: 'demasiados-intentos' });
  }));

  it('sin conexión devuelve «sin-conexion»', fakeAsync(() => {
    spyOnProperty(navigator, 'onLine').and.returnValue(false);
    expect(resolver(servicio.iniciarSesion(CORREO_DE_EJEMPLO))).toEqual({ ok: false, motivo: 'sin-conexion' });
    expect(servicio.autenticada()).toBeFalse();
  }));

  it('cerrar sesión la borra', fakeAsync(() => {
    resolver(servicio.iniciarSesion(CORREO_DE_EJEMPLO));
    servicio.cerrarSesion();
    expect(servicio.autenticada()).toBeFalse();
    expect(servicio.altaCompletada()).toBeFalse();
  }));
});
