/** Un elemento de la barra lateral del panel. */
export interface ElementoNavegacion {
  etiqueta: string;
  ruta: string;
}

/** Barra lateral del panel web */
export const NAVEGACION_PANEL: readonly ElementoNavegacion[] = [
  { etiqueta: 'Resumen', ruta: 'resumen' },
  { etiqueta: 'Alta / Ficha', ruta: 'ficha' },
  { etiqueta: 'Crear contenido', ruta: 'crear-contenido' },
  { etiqueta: 'Contenido', ruta: 'contenido' },
  { etiqueta: 'Oportunidades', ruta: 'oportunidades' },
  { etiqueta: 'Calendario', ruta: 'calendario' },
  { etiqueta: 'Perfil', ruta: 'perfil' },
];
