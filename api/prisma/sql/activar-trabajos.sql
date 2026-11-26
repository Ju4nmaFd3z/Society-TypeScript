-- Activa el worker en Supabase: avisa a la API al insertar un trabajo y hace
-- un barrido cada minuto (D-36). Se ejecuta UNA vez en Supabase → SQL Editor,
-- después de `npm run db:migrar`. Se puede volver a ejecutar sin problema.
--
-- No es una migración de Prisma porque pg_net, pg_cron y Vault solo existen en
-- Supabase, no en la base temporal que crea `prisma migrate dev`.

-- 1. Extensiones: pg_net hace peticiones HTTP y pg_cron programa tareas
CREATE EXTENSION IF NOT EXISTS pg_net;
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. La URL de la API y el secreto se guardan en Vault, nunca en git.
--    Ejecuta estas dos líneas solo la primera vez, con los valores reales:
-- SELECT vault.create_secret('https://society-api-xi.vercel.app/api/v1', 'trabajos_url');
-- SELECT vault.create_secret('<el mismo valor que TRABAJOS_SECRETO en Vercel>', 'trabajos_secreto');

-- 3. Llama a una ruta del worker con la cabecera X-Trabajos-Secreto
CREATE OR REPLACE FUNCTION public.avisar_worker(ruta text) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    url text;
    secreto text;
BEGIN
    SELECT decrypted_secret INTO url FROM vault.decrypted_secrets WHERE name = 'trabajos_url';
    SELECT decrypted_secret INTO secreto FROM vault.decrypted_secrets WHERE name = 'trabajos_secreto';

    -- pg_net envía la petición al terminar la transacción, sin esperar la respuesta
    PERFORM net.http_post(
        url := url || ruta,
        headers := jsonb_build_object('Content-Type', 'application/json', 'X-Trabajos-Secreto', secreto),
        body := '{}'::jsonb,
        timeout_milliseconds := 60000
    );
END
$$;

-- 4. Al insertar un trabajo, se avisa al worker (el Database Webhook de D-36)
CREATE OR REPLACE FUNCTION public.trabajo_insertado() RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    PERFORM public.avisar_worker('/trabajos/ejecutar');
    RETURN NEW;
END
$$;

DROP TRIGGER IF EXISTS al_insertar_trabajo ON public.trabajo;
CREATE TRIGGER al_insertar_trabajo
    AFTER INSERT ON public.trabajo
    FOR EACH ROW EXECUTE FUNCTION public.trabajo_insertado();

-- Solo las usa la base de datos: nadie puede llamarlas desde la API REST de Supabase
REVOKE EXECUTE ON FUNCTION public.avisar_worker(text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trabajo_insertado() FROM PUBLIC, anon, authenticated;

-- 5. Barrido cada minuto: reintentos, esperas vencidas y trabajos colgados.
--    Si ya existe una tarea con este nombre, pg_cron la sustituye.
SELECT cron.schedule('barrido-trabajos', '* * * * *', $$SELECT public.avisar_worker('/trabajos/barrido')$$);

-- Para comprobarlo: SELECT * FROM cron.job;
-- Para ver las peticiones enviadas: SELECT * FROM net._http_response ORDER BY created DESC LIMIT 5;
