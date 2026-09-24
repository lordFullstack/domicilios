-- ROLLBACK de S0: quita los triggers y las funciones. Vuelve a dejar abierta la escalada
-- de privilegios en profiles/restaurants; usar solo si el trigger bloquea un flujo legítimo
-- y mientras se corrige.
drop trigger if exists profiles_guard_update on public.profiles;
drop trigger if exists restaurants_guard_write on public.restaurants;
drop function if exists private.guard_profile_update();
drop function if exists private.guard_restaurant_write();
