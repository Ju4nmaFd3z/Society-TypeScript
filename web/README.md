# Society – web

Frontend de Society construido con Angular 19 y componentes standalone.

Está separado del backend y se despliega de forma independiente

## Requisitos

- Node.js LTS (se recomienda instalarlo con nvm)
- Angular CLI 19:

      npm install -g @angular/cli@19

## Arrancar en local

Desde la raíz del repositorio:

    cd web
    npm install
    npm start

La aplicación queda disponible en http://localhost:4200.

## Build de producción

    npm run build

El resultado se genera en `web/dist/web/browser`.

## Estilos

El panel usa Tailwind CSS con el tema «papel y cristal» de Figma.

- El tema (colores, tipografías, radios y sombras) está en `src/styles.css`, dentro de `@theme`.
- Clases del sistema de diseño: `.cristal-claro`, `.cristal-estandar`, `.cristal-denso`, `.pared`, `.item-navegacion`, `.boton-primario`, `.boton-secundario`, `.chip-activo`, `.chip` y `.campo-texto`. Los componentes de `shared/ui` las usan; en las páginas conviene usar el componente y no la clase suelta.
- Las fuentes Nunito y DynaPuff se instalan con npm (`@fontsource-variable`), sin servicios externos.


## Componentes reutilizables

Están en `src/app/shared/ui` y se importan desde `shared/ui` (`index.ts`): botón (`appBoton`, primario y secundario), campo de cristal con etiqueta, casilla, chip, etiquetas de origen, confianza y estado, tarjeta de cristal y los estados cargando, vacío y error (con «Reintentar»). El campo y la casilla funcionan con formularios reactivos (`formControlName`).

La página `/catalogo` los muestra todos. Es pública y solo sirve para desarrollo y revisión. Los valores salen de `docs/diseno/sistema-de-diseno.md` del repositorio Society.

## Tests

    npm test

Los tests de Karma necesitan un Chrome. En un entorno sin interfaz (CI, contenedor) hay que lanzar Chrome sin sandbox con una configuración de Karma propia.
