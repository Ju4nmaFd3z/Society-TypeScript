-- La tabla interna de Prisma también está en "public" y Supabase la expone en su API REST.
-- Con RLS y sin políticas, nadie puede leerla ni modificarla con la clave pública.
ALTER TABLE "_prisma_migrations" ENABLE ROW LEVEL SECURITY;
