-- Rollback de LOOP_CLIENT_05C · M4 (ejecutar DESPUÉS del rollback de M5)
alter table public.orders drop column if exists cash_amount;
