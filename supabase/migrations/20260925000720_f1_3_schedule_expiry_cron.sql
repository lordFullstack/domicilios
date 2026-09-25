-- LOOP_FLOW_01 · F1.3 — Programación del vencimiento (pg_cron cada 15 s)
--
-- REQUIERE F1.2. Instala pg_cron y programa private.expire_overdue_orders() cada 15 segundos.
-- Con 15 s de cadencia el vencimiento real cae entre 120 y 135 s (las RPC ya rechazan lo vencido).
-- Reversible: ver el .rollback.sql

create extension if not exists pg_cron;

select cron.unschedule(jobid) from cron.job where jobname = 'expire_overdue_orders';

select cron.schedule(
  'expire_overdue_orders',
  '15 seconds',
  $$select private.expire_overdue_orders()$$
);
