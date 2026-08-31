-- ============================================================
-- KetoBoutique — Production Reset Script
-- Ejecutar en Supabase SQL Editor antes del lanzamiento
-- https://supabase.com/dashboard/project/ydssmpngsjjigsklfolq/sql/new
-- ============================================================

-- 1. Limpiar todos los pedidos (test data)
DELETE FROM public.orders;

-- 2. Limpiar todos los registros de contabilidad
DELETE FROM public.accounting;

-- 3. Resetear contadores en config a cero
UPDATE public.config SET value = '0'    WHERE key = 'whatsapp_redirects';
UPDATE public.config SET value = '0'    WHERE key = 'total_visits';

-- 4. Asegurarse de que la tienda quede abierta
UPDATE public.config SET value = 'open' WHERE key = 'store_status';

-- ── Verificación (ejecutar después) ──────────────────────────────────────────
SELECT key, value FROM public.config ORDER BY key;
SELECT COUNT(*) AS pedidos   FROM public.orders;
SELECT COUNT(*) AS contables FROM public.accounting;
-- ─────────────────────────────────────────────────────────────────────────────
-- Resultado esperado:
--   store_status       | open
--   total_visits       | 0
--   whatsapp_redirects | 0
--   pedidos            | 0
--   contables          | 0
