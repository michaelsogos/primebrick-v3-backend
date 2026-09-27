-- Fire-and-forget: create public.pg_raise(code, message, detail).
-- Raises a PG exception with a custom SQLSTATE from plain SQL (DAL CTEs) —
-- emits ERR04 (unique conflict, live row) / ERR05 (soft-deleted row) with
-- the conflicting row's uuid + constraint name in DETAIL (jsonb).
-- Idempotent — safe to run multiple times. Mirrors 00000000000000_init_database.sql.
CREATE OR REPLACE FUNCTION public.pg_raise(p_code text, p_message text, p_detail text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
AS $func$
BEGIN
  RAISE EXCEPTION '%', p_message USING ERRCODE = p_code, DETAIL = p_detail;
END;
$func$;

GRANT EXECUTE ON FUNCTION public.pg_raise(text, text, text) TO primebrick;
GRANT EXECUTE ON FUNCTION public.pg_raise(text, text, text) TO public;
