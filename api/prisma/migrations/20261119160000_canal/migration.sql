-- CreateTable
CREATE TABLE "canal" (
    "id" UUID NOT NULL,
    "restaurante_id" UUID NOT NULL,
    "tipo" TEXT NOT NULL,
    "valor" TEXT NOT NULL,
    "fuente" TEXT NOT NULL,
    "acepta_reservas" BOOLEAN NOT NULL DEFAULT false,
    "editado" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "canal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "canal_restaurante_id_tipo_valor_key" ON "canal"("restaurante_id", "tipo", "valor");

-- AddForeignKey
ALTER TABLE "canal" ADD CONSTRAINT "canal_restaurante_id_fkey" FOREIGN KEY ("restaurante_id") REFERENCES "restaurante"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Seguridad (añadido a mano): igual que en la migración inicial, Supabase publica
-- las tablas de "public" en su API REST. Con RLS activado y sin políticas, nadie
-- puede leerla con la clave pública; solo la API.
ALTER TABLE "canal" ENABLE ROW LEVEL SECURITY;
