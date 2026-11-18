import { Routes } from '@angular/router';
import { PanelLayoutComponent } from './core/layout/panel-layout/panel-layout.component';
import { altaCompletada, conSesion, sinSesion } from './core/sesion/guards';

const paginaVacia = () =>
  import('./core/layout/pagina-vacia/pagina-vacia.component').then((m) => m.PaginaVaciaComponent);

/**
 * Rutas del panel (SOCIETY-55). Todas son lazy.
 * PROVISIONAL: salvo `/acceso` (S01A), las vistas son páginas vacías hasta su sprint.
 * Los guards usan una sesión simulada (`SesionSimuladaService`).
 */
export const routes: Routes = [
  {
    path: 'acceso',
    canActivate: [sinSesion],
    loadComponent: () => import('./features/acceso/acceso.component').then((m) => m.AccesoComponent),
  },
  {
    // Catálogo de componentes reutilizables (SOCIETY-54). Público, solo para desarrollo y revisión.
    path: 'catalogo',
    loadComponent: () => import('./features/catalogo/catalogo.component').then((m) => m.CatalogoComponent),
  },
  {
    path: '',
    component: PanelLayoutComponent,
    canActivate: [conSesion],
    children: [
      { path: '', redirectTo: 'resumen', pathMatch: 'full' },

      // Con sesión, aunque el alta del local esté sin terminar
      { path: 'alta/buscar', loadComponent: paginaVacia, data: { titulo: 'Alta · Buscar tu local' } },
      { path: 'alta/manual', loadComponent: paginaVacia, data: { titulo: 'Alta · Añadir a mano' } },
      { path: 'alta/analisis/:id', loadComponent: paginaVacia, data: { titulo: 'Alta · Análisis' } },
      { path: 'ficha', loadComponent: paginaVacia, data: { titulo: 'Alta / Ficha' } },
      { path: 'perfil', loadComponent: paginaVacia, data: { titulo: 'Perfil' } },

      // Con el alta completada
      {
        path: '',
        canActivate: [altaCompletada],
        children: [
          { path: 'resumen', loadComponent: paginaVacia, data: { titulo: 'Resumen' } },
          { path: 'crear/idea', loadComponent: paginaVacia, data: { titulo: 'Crear · Idea' } },
          { path: 'crear/estetica', loadComponent: paginaVacia, data: { titulo: 'Crear · Estética' } },
          { path: 'crear/fotos', loadComponent: paginaVacia, data: { titulo: 'Crear · Fotos' } },
          { path: 'contenido', loadComponent: paginaVacia, data: { titulo: 'Contenido' } },
          { path: 'contenido/:id', loadComponent: paginaVacia, data: { titulo: 'Pieza de contenido' } },
          { path: 'contenido/:id/publicar', loadComponent: paginaVacia, data: { titulo: 'Publicar' } },
          // La lista no figura en la tarea, pero la barra lateral enlaza a ella
          { path: 'oportunidades', loadComponent: paginaVacia, data: { titulo: 'Oportunidades' } },
          { path: 'oportunidades/:id', loadComponent: paginaVacia, data: { titulo: 'Oportunidad' } },
          { path: 'calendario', loadComponent: paginaVacia, data: { titulo: 'Calendario' } },
        ],
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
