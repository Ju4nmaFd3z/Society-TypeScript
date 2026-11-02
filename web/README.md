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

