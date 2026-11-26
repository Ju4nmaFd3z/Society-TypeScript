-- CreateTable
CREATE TABLE "trabajo" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tipo" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "fase" INTEGER NOT NULL DEFAULT 0,
    "datos" JSONB NOT NULL DEFAULT '{}',
    "intentos" INTEGER NOT NULL DEFAULT 0,
    "ejecutar_despues_de" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bloqueado_en" TIMESTAMPTZ(6),
    "idempotency_key" TEXT,
    "error" TEXT,
    "creado_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trabajo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "trabajo_idempotency_key_key" ON "trabajo"("idempotency_key");

-- CreateIndex
CREATE INDEX "trabajo_estado_ejecutar_despues_de_idx" ON "trabajo"("estado", "ejecutar_despues_de");

-- Seguridad (añadido a mano): igual que el resto de tablas, RLS activado y sin
-- políticas para que nadie la lea con la clave pública de Supabase.
ALTER TABLE "trabajo" ENABLE ROW LEVEL SECURITY;

-- Añadido a mano: reclama el siguiente trabajo pendiente y lo marca EN_CURSO.
-- FOR UPDATE SKIP LOCKED salta las filas que otro worker ya está reclamando,
-- así dos llamadas a la vez nunca se llevan el mismo trabajo.
CREATE FUNCTION "reclamar_trabajo"() RETURNS SETOF "trabajo"
LANGUAGE sql
AS $$
    UPDATE "trabajo"
    SET "estado" = 'EN_CURSO', "bloqueado_en" = now(), "actualizado_en" = now()
    WHERE "id" = (
        SELECT "id" FROM "trabajo"
        WHERE "estado" = 'PENDIENTE' AND "ejecutar_despues_de" <= now()
        ORDER BY "ejecutar_despues_de"
        LIMIT 1
        FOR UPDATE SKIP LOCKED
    )
    RETURNING *;
$$;

-- Supabase deja llamar a las funciones de "public" desde su API REST.
-- Esta solo la usa la API, así que se le quita el permiso a todos los demás.
REVOKE EXECUTE ON FUNCTION "reclamar_trabajo"() FROM PUBLIC;
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
        REVOKE EXECUTE ON FUNCTION "reclamar_trabajo"() FROM anon, authenticated;
    END IF;
END
$$;
