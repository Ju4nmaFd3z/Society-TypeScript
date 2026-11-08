import { Routes } from '@angular/router';
import { PanelLayoutComponent } from './core/layout/panel-layout/panel-layout.component';

const paginaVacia = () =>
  import('./core/layout/pagina-vacia/pagina-vacia.component').then((m) => m.PaginaVaciaComponent);

// PROVISIONAL: rutas mínimas para que exista la navegación lateral (SOCIETY-34).
// El router definitivo, con guards y redirecciones de sesión, es SOCIETY-55.
export const routes: Routes = [
  {
    path: '',
    component: PanelLayoutComponent,
    children: [
      { path: '', redirectTo: 'resumen', pathMatch: 'full' },
      { path: 'resumen', loadComponent: paginaVacia, data: { titulo: 'Resumen' } },
      { path: 'ficha', loadComponent: paginaVacia, data: { titulo: 'Alta / Ficha' } },
      { path: 'crear-contenido', loadComponent: paginaVacia, data: { titulo: 'Crear contenido' } },
      { path: 'contenido', loadComponent: paginaVacia, data: { titulo: 'Contenido' } },
      { path: 'oportunidades', loadComponent: paginaVacia, data: { titulo: 'Oportunidades' } },
      { path: 'calendario', loadComponent: paginaVacia, data: { titulo: 'Calendario' } },
      { path: 'perfil', loadComponent: paginaVacia, data: { titulo: 'Perfil' } },
    ],
  },
];
