import { Location } from '@angular/common';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { routes } from './app.routes';
import { CORREO_DE_EJEMPLO, SesionSimuladaService } from './core/sesion/sesion-simulada.service';

describe('Rutas del panel (SOCIETY-55)', () => {
  let sesion: SesionSimuladaService;
  let router: Router;
  let ubicacion: Location;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
    sesion = TestBed.inject(SesionSimuladaService);
    router = TestBed.inject(Router);
    ubicacion = TestBed.inject(Location);
  });

  async function ir(url: string): Promise<string> {
    await router.navigateByUrl(url);
    return ubicacion.path();
  }

  function entrar(correo: string, registrar = false): void {
    (registrar ? sesion.registrar(correo) : sesion.iniciarSesion(correo)).then(() => {});
    tick(400);
  }

  const rutasConAlta = [
    '/resumen',
    '/crear/idea',
    '/crear/estetica',
    '/crear/fotos',
    '/contenido',
    '/contenido/42',
    '/contenido/42/publicar',
    '/oportunidades',
    '/oportunidades/7',
    '/calendario',
  ];
  const rutasSoloSesion = ['/alta/buscar', '/alta/manual', '/alta/analisis/3', '/ficha', '/perfil'];

  it('sin sesión, cualquier vista del panel lleva a /acceso', async () => {
    for (const ruta of [...rutasConAlta, ...rutasSoloSesion]) {
      expect(await ir(ruta)).withContext(ruta).toBe('/acceso');
    }
  });

  it('sin sesión, /acceso y /catalogo se abren', async () => {
    expect(await ir('/acceso')).toBe('/acceso');
    expect(await ir('/catalogo')).toBe('/catalogo');
  });

  it('con sesión y alta completada se navega a todas las vistas', fakeAsync(() => {
    entrar(CORREO_DE_EJEMPLO);
    for (const ruta of [...rutasConAlta, ...rutasSoloSesion]) {
      router.navigateByUrl(ruta);
      tick();
      expect(ubicacion.path()).withContext(ruta).toBe(ruta);
    }
  }));

  it('con sesión, /acceso redirige al resumen', fakeAsync(() => {
    entrar(CORREO_DE_EJEMPLO);
    router.navigateByUrl('/acceso');
    tick();
    expect(ubicacion.path()).toBe('/resumen');
  }));

  it('con el alta pendiente, las vistas que la exigen llevan a /alta/buscar y las demás se abren', fakeAsync(() => {
    entrar('nuevo@ejemplo.es', true);
    for (const ruta of rutasConAlta) {
      router.navigateByUrl(ruta);
      tick();
      expect(ubicacion.path()).withContext(ruta).toBe('/alta/buscar');
    }
    for (const ruta of rutasSoloSesion) {
      router.navigateByUrl(ruta);
      tick();
      expect(ubicacion.path()).withContext(ruta).toBe(ruta);
    }
  }));

  it('una ruta que no existe vuelve al inicio', async () => {
    expect(await ir('/no-existe')).toBe('/acceso');
  });
});
