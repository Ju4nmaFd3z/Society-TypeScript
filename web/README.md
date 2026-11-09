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
- Clases base: `.hoja-cristal`, `.tarjeta-cristal` y `.boton-amarillo`. Nuevas del sistema de diseño: `.cristal-claro`, `.cristal-estandar`, `.cristal-denso`, `.pared`, `.item-navegacion` y `.boton-primario`; provisionales hasta SOCIETY-54: `.boton-secundario`, `.chip-activo`, `.chip` y `.campo-texto`.
- Las fuentes Nunito y DynaPuff se instalan con npm (`@fontsource-variable`), sin servicios externos.

