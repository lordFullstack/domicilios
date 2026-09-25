-- Rollback de LOOP_FLOW_01 · F1.3
select cron.unschedule(jobid) from cron.job where jobname = 'expire_overdue_orders';
-- La extensión pg_cron se deja instalada (otros trabajos podrían usarla).
