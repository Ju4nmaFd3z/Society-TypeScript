import { Routes } from '@angular/router';
import { PanelLayoutComponent } from './core/layout/panel-layout/panel-layout.component';
import { altaCompletada, conSesion, sinSesion } from './core/sesion/guards';

// Carga la página vacía solo cuando se entra en la ruta (lazy)
const paginaVacia = () =>
  import('./core/layout/pagina-vacia/pagina-vacia.component').then((m) => m.PaginaVaciaComponent);

export const routes: Routes = [
  // Pantalla de acceso, fuera del panel
  {
    path: 'acceso',
    canActivate: [sinSesion],
    loadComponent: () => import('./features/acceso/acceso.component').then((m) => m.AccesoComponent),
  },

  // Catálogo de componentes, público y solo para revisar el diseño
  {
    path: 'catalogo',
    loadComponent: () => import('./features/catalogo/catalogo.component').then((m) => m.CatalogoComponent),
  },

  // Panel con barra lateral: todo lo de dentro pide sesión
  {
    path: '',
    component: PanelLayoutComponent,
    canActivate: [conSesion],
    children: [
      { path: '', redirectTo: 'resumen', pathMatch: 'full' },

      // Con sesión, aunque el local no esté dado de alta
      { path: 'alta/buscar', loadComponent: paginaVacia, data: { titulo: 'Alta · Buscar tu local' } },
      { path: 'alta/manual', loadComponent: paginaVacia, data: { titulo: 'Alta · Añadir a mano' } },
      { path: 'alta/analisis/:id', loadComponent: paginaVacia, data: { titulo: 'Alta · Análisis' } },
      { path: 'ficha', loadComponent: paginaVacia, data: { titulo: 'Alta / Ficha' } },
      { path: 'perfil', loadComponent: paginaVacia, data: { titulo: 'Perfil' } },

      // Solo con el local dado de alta
      { path: 'resumen', canActivate: [altaCompletada], loadComponent: paginaVacia, data: { titulo: 'Resumen' } },
      { path: 'crear/idea', canActivate: [altaCompletada], loadComponent: paginaVacia, data: { titulo: 'Crear · Idea' } },
      { path: 'crear/estetica', canActivate: [altaCompletada], loadComponent: paginaVacia, data: { titulo: 'Crear · Estética' } },
      { path: 'crear/fotos', canActivate: [altaCompletada], loadComponent: paginaVacia, data: { titulo: 'Crear · Fotos' } },
      { path: 'contenido', canActivate: [altaCompletada], loadComponent: paginaVacia, data: { titulo: 'Contenido' } },
      { path: 'contenido/:id', canActivate: [altaCompletada], loadComponent: paginaVacia, data: { titulo: 'Pieza de contenido' } },
      { path: 'contenido/:id/publicar', canActivate: [altaCompletada], loadComponent: paginaVacia, data: { titulo: 'Publicar' } },
      { path: 'oportunidades', canActivate: [altaCompletada], loadComponent: paginaVacia, data: { titulo: 'Oportunidades' } },
      { path: 'oportunidades/:id', canActivate: [altaCompletada], loadComponent: paginaVacia, data: { titulo: 'Oportunidad' } },
      { path: 'calendario', canActivate: [altaCompletada], loadComponent: paginaVacia, data: { titulo: 'Calendario' } },
    ],
  },

  // Cualquier otra dirección vuelve al inicio
  { path: '**', redirectTo: '' },
];
