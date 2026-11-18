import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SesionSimuladaService } from './sesion-simulada.service';

// Solo deja pasar a quien NO ha iniciado sesión (pantalla de acceso)
export const sinSesion: CanActivateFn = () => {
  const sesion = inject(SesionSimuladaService);
  const router = inject(Router);

  if (!sesion.haySesion()) {
    return true;
  }
  return router.parseUrl(sesion.rutaDeInicio());
};

// Solo deja pasar a quien ha iniciado sesión
export const conSesion: CanActivateFn = () => {
  const sesion = inject(SesionSimuladaService);
  const router = inject(Router);

  if (sesion.haySesion()) {
    return true;
  }
  return router.parseUrl('/acceso');
};

// Solo deja pasar a quien ya ha dado de alta su local
export const altaCompletada: CanActivateFn = () => {
  const sesion = inject(SesionSimuladaService);
  const router = inject(Router);

  if (sesion.altaCompletada()) {
    return true;
  }
  return router.parseUrl('/alta/buscar');
};
