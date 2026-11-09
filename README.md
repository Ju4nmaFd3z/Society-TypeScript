# Society-TypeScript

Parte de Society desarrollada en TypeScript.

Forma parte del proyecto Society. La documentación de producto, diseño y marca está en el repositorio general: [Society](https://github.com/Ju4nmaFd3z/Society).

## Estado

Repositorio en desarrollo. Contiene tres partes:
 
- [`api/`](api/): backend compartido con Express 5, TypeScript y Prisma sobre Supabase. Lo usan la app Android y el panel web, y también alojará el worker de trabajos largos (todavía por hacer). Hoy tiene las rutas, controladores y servicios base, el formato de error común, la primera migración (`perfil_usuario` y `restaurante`) y `/api/v1/salud` desplegado en Vercel. Cómo arrancarla y desplegarla: [api/README.md](api/README.md).
  
- [`web/`](web/): panel Angular 19 con Tailwind CSS. Hoy tiene el proyecto creado, el tema de cristal y el layout del panel con páginas vacías; las vistas reales llegan en sprints posteriores. Cómo arrancarlo: [web/README.md](web/README.md).
  
- [`contrato/`](contrato/): `openapi.yaml`, el contrato de la API. Hoy (v0.2.0) documenta `/salud`, `/auth` (registro, acceso y refresco), `/restaurantes` (alta y consulta del local), `/analisis` y las rutas de Places (`/places/search` y `/places/photo`). El resto se añade a medida que se programa cada parte, hasta completarlo en el sprint 5. Cualquier cambio en la API se hace antes aquí, en una pull request revisada por Android y Angular.
Para arrancar en local hace falta Node.js (24 o superior para `api/`). Cada parte se arranca desde su carpeta:
 
    cd api
    npm install
    cp .env.example .env   # y rellena los valores (pídelos al equipo)
    npm run dev            # http://localhost:3000/api/v1/salud
 
    cd web
    npm install
    npm start              # http://localhost:4200
 
La arquitectura (clientes, backend, datos y despliegue) está en [Society/docs/arquitectura](https://github.com/Ju4nmaFd3z/Society/tree/main/docs/arquitectura).

## Convenciones

Commits, ramas y estilo de documentación siguen la [guía de estilo](https://github.com/Ju4nmaFd3z/Society/blob/main/docs/guia-de-estilo.md) del proyecto.

## Licencia

Pendiente de definir. Hasta entonces, todos los derechos reservados.
