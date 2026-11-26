# API de SOCIETY

API REST de SOCIETY con Express 5 y TypeScript. La usan la app Android y el panel web: ningún cliente habla directamente con Supabase.

## Estructura

```
src/
├── app.ts            crea la app, monta /api/v1 y los middlewares. Vercel despliega este archivo
├── local.ts          arranca el servidor solo en local (npm run dev)
├── routes/           asocia cada método y camino con su controlador
├── controllers/      traduce entre HTTP y los servicios (lee req, responde con res)
├── services/         lógica de negocio, sin nada de Express
├── validaciones/     reglas del cuerpo de cada petición, con zod
├── trabajos/         una función por tipo de trabajo del worker (manejadores.ts)
├── db/               conexión de Prisma y cliente de Supabase Auth, compartidos por toda la API
├── middlewares/      404, manejador de errores, requiereAuth (rutas privadas) y requiereSecretoTrabajos (rutas del worker)
├── types/            amplía la Request de Express con userId
└── utils/            ErrorApi y códigos de error comunes
```

## Rutas hechas

| Ruta | Acceso | Qué hace |
|---|---|---|
| `GET /salud` | pública | `{ok: true}` |
| `POST /auth/registro` | pública | crea el usuario en Supabase Auth (ya confirmado) y su `perfil_usuario`. Devuelve la sesión |
| `POST /auth/acceso` | pública | inicia sesión y devuelve `{accessToken, refreshToken, expiraEn}` |
| `GET /places/search?q=&pageToken=` | con token | busca en Google Places y devuelve `{resultados, nextPageToken?}`, cada resultado con hasta 5 `fotos` (`{name, atribuciones}`). La página siguiente se pide con `pageToken`. 429 `LIMITE_ALCANZADO` si Google agota la cuota |
| `GET /restaurantes/mio` | con token | dice en qué punto del alta está el usuario: `{restaurante, altaEstado}`. Sin local, `restaurante: null` y `altaEstado: SIN_LOCAL`. Solo lee el local de quien pregunta |
| `GET /places/photo?name=&maxWidthPx=` | con token | recibe el `name` de una foto y devuelve `{photoUri}`. 400 si `name` o `maxWidthPx` no son válidos, 404 si la foto no existe |
| `POST /restaurantes` | con token | da de alta el local del usuario y lo deja en `CREADO`. Con `origen: GOOGLE` lee los datos básicos en Place Details y guarda la web y el teléfono como canales; con `origen: MANUAL` guarda lo que escribe el usuario. Devuelve `{id, nombre, origen, altaEstado}`. 400 `VALIDACION` si el cuerpo no es válido, 409 `DUPLICADO` si el usuario ya tiene local o el local de Google ya es de otra cuenta |
| `POST /auth/refresco` | pública | con `{refreshToken}` devuelve dos tokens nuevos. El usado deja de valer. 401 `SESION_CADUCADA` si no vale |

Las rutas privadas llevan `requiereAuth` delante del controlador. Exige la cabecera `Authorization: Bearer <accessToken>`, la valida con Supabase y deja el id del usuario en `req.userId`. Sin token o con uno no válido responde 401 `SESION_CADUCADA`. El detalle de cada ruta está en el [contrato](../contrato/openapi.yaml).

Una petición recorre: `routes` → `controllers` → `services`. Si algo falla, el error llega a `middlewares/errores.ts`, que responde siempre con el mismo formato:

```json
{ "error": { "code": "NO_ENCONTRADO", "message": "No existe la ruta GET /api/v1/nada", "retryable": false } }
```

Para devolver un error controlado desde cualquier capa: `throw new ErrorApi(404, 'NO_ENCONTRADO', 'No existe ese local')`.

El cuerpo de las peticiones se comprueba con [zod](https://zod.dev) en `validaciones/`. El controlador llama a `safeParse` y, si falla, responde 400 `VALIDACION` con el primer error. Si pasa, los datos llegan al servicio ya tipados.

## Worker: cola de trabajos

Lo que tarda (análisis, imágenes, publicar en Instagram) no se hace en la petición del cliente. La API inserta una fila en la tabla `trabajo` y el worker la ejecuta por fases (D-28 y D-36). El worker son estas dos rutas internas de la misma API. No están en el contrato porque los clientes no las llaman: las llama Supabase, con la cabecera `X-Trabajos-Secreto` igual a `TRABAJOS_SECRETO`. Sin ella, 401.

| Ruta | La llama | Qué hace |
|---|---|---|
| `POST /trabajos/ejecutar` | Supabase, al insertar un trabajo | ejecuta los trabajos pendientes, uno tras otro, hasta 240 s |
| `POST /trabajos/barrido` | `pg_cron`, cada minuto | rescata los trabajos colgados más de 10 min y ejecuta los pendientes cuya espera ha vencido |

Cada trabajo pasa por `PENDIENTE` → `EN_CURSO` → `HECHO`, o `ERROR` si una fase falla cuatro veces seguidas (se reintenta a los 10 s, 30 s y 90 s). `reclamar_trabajo()`, en la migración `trabajo`, lo reserva con `FOR UPDATE SKIP LOCKED`, así dos llamadas a la vez nunca ejecutan el mismo. Para un tipo nuevo, se añade su función en `src/trabajos/manejadores.ts`.

**Activarlo en Supabase** (una vez, después de `npm run db:migrar`): en SQL Editor, guarda en Vault la URL de la API y el secreto, y ejecuta [prisma/sql/activar-trabajos.sql](prisma/sql/activar-trabajos.sql). Crea el aviso al insertar y el barrido de cada minuto. No es una migración porque `pg_net`, `pg_cron` y Vault solo existen en Supabase.

**Probarlo:** en SQL Editor, `INSERT INTO trabajo (tipo) VALUES ('PRUEBA');`. En unos segundos queda en `HECHO`. Con `datos` `'{"fases": 3}'` hace tres fases y con `'{"fallar": true}'` prueba los reintentos.

## Arrancar en local

Requisitos: Node 24 o superior.

```bash
cd api
npm install
cp .env.example .env   # y rellena los valores (pídelos al equipo)
npm run dev
```

Comprueba que responde: <https://society-api-xi.vercel.app/api/v1/salud> → `{"ok":true}`.

| Script | Para qué |
|---|---|
| `npm run dev` | servidor local que se reinicia al guardar |
| `npm run typecheck` | comprueba los tipos sin generar nada |
| `npm run build` | compila a `dist/` |

## Base de datos (Prisma + Supabase)

Prisma 7 sobre el Postgres de Supabase. Se usan dos conexiones:

| Variable | Conexión | La usa |
|---|---|---|
| `DATABASE_URL` | transaction pooler (puerto 6543, `?pgbouncer=true`) | la API en marcha ([src/db/prisma.ts](src/db/prisma.ts)) |
| `DIRECT_URL` | session pooler (puerto 5432) | el CLI de Prisma para las migraciones ([prisma.config.ts](prisma.config.ts)) |

| Archivo | Para qué |
|---|---|
| [prisma/schema.prisma](prisma/schema.prisma) | las tablas. Nombres en castellano `snake_case` (D-21), según el diccionario de datos |
| `prisma/migrations/` | el SQL de cada cambio. Se sube a git y no se edita a mano una vez aplicado |
| `src/generated/prisma/` | cliente generado por `prisma generate`. No se sube a git |

Todas las tablas llevan RLS activado y sin políticas: así no se pueden leer con la clave pública de Supabase. Prisma entra con el usuario `postgres`, que se salta RLS.

| Comando | Para qué |
|---|---|
| `npm run db:migrar` | aplica en Supabase las migraciones pendientes |
| `npm run db:comprobar` | comprueba que la API lee la tabla `restaurante` |
| `npx prisma migrate dev --name <nombre>` | tras cambiar el schema, crea una migración nueva y la aplica |
| `npx prisma db seed` | carga los datos de prueba |
| `npx prisma studio` | ver y editar los datos en el navegador |

## Despliegue en Vercel

1. En Vercel, **Add New → Project** e importar el repositorio `Society-TypeScript`.
2. **Root Directory:** `api`. Vercel detecta Express solo; no hace falta `vercel.json`.
3. En **Environment Variables**, añadir las mismas variables que `.env.example` con sus valores.
4. Desplegar y comprobar `https://<proyecto>.vercel.app/api/v1/salud`.

El panel web (`web/`) es otro proyecto de Vercel distinto sobre el mismo repositorio, con raíz en `web`.
