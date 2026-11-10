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
├── db/               conexión de Prisma compartida por toda la API
├── middlewares/      404 y manejador de errores
└── utils/            ErrorApi y códigos de error comunes
```

Una petición recorre: `routes` → `controllers` → `services`. Si algo falla, el error llega a `middlewares/errores.ts`, que responde siempre con el mismo formato:

```json
{ "error": { "code": "NO_ENCONTRADO", "message": "No existe la ruta GET /api/v1/nada", "retryable": false } }
```

Para devolver un error controlado desde cualquier capa: `throw new ErrorApi(404, 'NO_ENCONTRADO', 'No existe ese local')`.

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
