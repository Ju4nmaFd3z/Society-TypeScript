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

Están en `src/app/shared/ui`, uno por carpeta: botón (`app-boton`, primario y secundario), campo de cristal con etiqueta, casilla, chip, etiquetas de origen, confianza y estado, tarjeta de cristal y los estados cargando, vacío y error (con «Reintentar»). Reciben sus datos con `@Input` y avisan con `@Output`. El campo y la casilla reciben su `FormControl` en la entrada `control`.

La página `/catalogo` los muestra todos. Es pública y solo sirve para desarrollo y revisión. Los valores salen de `docs/diseno/sistema-de-diseno.md` del repositorio Society.

## Rutas y sesión

Las rutas están en `src/app/app.routes.ts` y todas son lazy. Salvo `/acceso`, las vistas son páginas vacías hasta su sprint.

| Rutas | Quién entra |
| --- | --- |
| `/acceso` | Solo quien no tiene sesión (`sinSesion`) |
| `/alta/buscar`, `/alta/manual`, `/alta/analisis/:id`, `/ficha`, `/perfil` | Con sesión (`conSesion`) |
| `/resumen`, `/crear/idea\|estetica\|fotos`, `/contenido`, `/contenido/:id`, `/contenido/:id/publicar`, `/oportunidades`, `/oportunidades/:id`, `/calendario` | Con sesión y el alta del local completada (`altaCompletada`) |
| `/catalogo` | Cualquiera |

Los guards (`core/sesion/guards.ts`) usan `SesionSimuladaService`, que es **provisional**: no hay API de autenticación todavía.

- No recibe ni guarda la contraseña.
- La sesión solo existe en memoria: al recargar la página se pierde.
- `local@ejemplo.es` (con cualquier contraseña de 8 caracteres o más) entra con el alta completada y va a `/resumen`. Un correo nuevo crea una cuenta con el alta pendiente y va a `/alta/buscar`. Un correo desconocido da «credenciales incorrectas».

## Tests

    npm test

Los tests de Karma necesitan un Chrome. En un entorno sin interfaz (CI, contenedor) hay que lanzar Chrome sin sandbox con una configuración de Karma propia.
