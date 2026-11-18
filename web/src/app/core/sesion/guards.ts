import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SesionSimuladaService } from './sesion-simulada.service';

/** Solo para quien NO tiene sesión (S01A). Con sesión, va a su destino. */
export const sinSesion: CanActivateFn = () => {
  const sesion = inject(SesionSimuladaService);
  return sesion.autenticada() ? inject(Router).createUrlTree([sesion.destinoInicial()]) : true;
};

/** Solo con sesión. Sin ella, va a `/acceso`. */
export const conSesion: CanActivateFn = () => {
  const sesion = inject(SesionSimuladaService);
  return sesion.autenticada() ? true : inject(Router).createUrlTree(['/acceso']);
};

/** Solo con el alta del local completada. Si no, vuelve al inicio del alta. */
export const altaCompletada: CanActivateFn = () => {
  const sesion = inject(SesionSimuladaService);
  return sesion.altaCompletada() ? true : inject(Router).createUrlTree(['/alta/buscar']);
};
