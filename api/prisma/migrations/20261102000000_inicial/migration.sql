-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "perfil_usuario" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "nombre" TEXT,
    "terminos_version" TEXT NOT NULL,
    "terminos_aceptados_en" TIMESTAMPTZ(6) NOT NULL,
    "creado_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "perfil_usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "restaurante" (
    "id" UUID NOT NULL,
    "owner_id" UUID NOT NULL,
    "origen" TEXT NOT NULL,
    "google_place_id" TEXT,
    "nombre" TEXT NOT NULL,
    "apodo" TEXT,
    "tipo" TEXT,
    "direccion" TEXT NOT NULL,
    "municipio" TEXT NOT NULL,
    "provincia" TEXT,
    "latitud" DOUBLE PRECISION,
    "longitud" DOUBLE PRECISION,
    "telefono" TEXT,
    "tipo_google" TEXT,
    "horario" JSONB,
    "google_maps_uri" TEXT,
    "datos_google_leidos_en" TIMESTAMPTZ(6),
    "alta_estado" TEXT NOT NULL DEFAULT 'CREADO',
    "declara_gestor_en" TIMESTAMPTZ(6) NOT NULL,
    "creado_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "restaurante_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "restaurante_owner_id_key" ON "restaurante"("owner_id");

-- CreateIndex
CREATE UNIQUE INDEX "restaurante_google_place_id_key" ON "restaurante"("google_place_id");

-- AddForeignKey
ALTER TABLE "restaurante" ADD CONSTRAINT "restaurante_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "perfil_usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Seguridad (añadido a mano): Supabase publica las tablas de "public" en su API REST.
-- Con RLS activado y sin políticas, nadie puede leerlas con la clave pública;
-- solo la API (Prisma entra con el usuario postgres, que se salta RLS).
ALTER TABLE "perfil_usuario" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "restaurante" ENABLE ROW LEVEL SECURITY;
