-- Rollback de LOOP_CLIENT_05C · M6 (ejecutar DESPUÉS del rollback de M7)
alter table public.orders drop column if exists notes_to_restaurant;
