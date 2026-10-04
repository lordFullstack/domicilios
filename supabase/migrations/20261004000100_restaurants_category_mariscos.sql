-- La web y la app ya ofrecen "Mariscos" como categoría, pero la base no la aceptaba.
alter table public.restaurants drop constraint restaurants_category_check;
alter table public.restaurants add constraint restaurants_category_check
  check (category = any (array['Pizza'::text, 'Burgers'::text, 'Sushi'::text, 'Postres'::text, 'Bebidas'::text, 'Asados'::text, 'Mariscos'::text]));
