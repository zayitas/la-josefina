-- Ejecutar una sola vez en el SQL Editor del proyecto Supabase compartido.
-- Los cambios se autorizan por store_id: cada dueño solo administra su negocio.
create table public.stores (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null check (length(trim(name)) > 0),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.menu_admins (
  user_id uuid not null references auth.users (id) on delete cascade,
  store_id uuid not null references public.stores (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, store_id)
);

create table public.menu_sections (
  store_id uuid not null references public.stores (id) on delete cascade,
  slug text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (length(trim(title)) > 0),
  description text not null default '',
  position integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  primary key (store_id, slug)
);

create table public.menu_products (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null,
  section_slug text not null,
  name text not null check (length(trim(name)) > 0),
  description text not null default '',
  price integer check (price is null or price >= 0),
  kind text not null default 'dish' check (kind in ('dish', 'price_option')),
  position integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  foreign key (store_id, section_slug)
    references public.menu_sections (store_id, slug) on update cascade on delete restrict
);

create index menu_products_store_order_idx on public.menu_products (store_id, section_slug, position);

alter table public.stores enable row level security;
alter table public.menu_admins enable row level security;
alter table public.menu_sections enable row level security;
alter table public.menu_products enable row level security;

revoke all on public.menu_admins from anon, authenticated;
grant select on public.stores, public.menu_sections, public.menu_products to anon, authenticated;
grant insert, update, delete on public.menu_sections, public.menu_products to authenticated;

create or replace function public.is_menu_admin(p_store_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.menu_admins
    where user_id = (select auth.uid()) and store_id = p_store_id
  );
$$;

revoke all on function public.is_menu_admin(uuid) from public;
grant execute on function public.is_menu_admin(uuid) to anon, authenticated;

create policy "Anyone reads active stores"
  on public.stores for select to anon, authenticated using (active);
create policy "Anyone reads active menu sections"
  on public.menu_sections for select to anon, authenticated
  using (active or (select public.is_menu_admin(store_id)));
create policy "Owner creates menu sections for their store"
  on public.menu_sections for insert to authenticated
  with check ((select public.is_menu_admin(store_id)));
create policy "Owner updates menu sections for their store"
  on public.menu_sections for update to authenticated
  using ((select public.is_menu_admin(store_id))) with check ((select public.is_menu_admin(store_id)));
create policy "Owner removes menu sections for their store"
  on public.menu_sections for delete to authenticated
  using ((select public.is_menu_admin(store_id)));

create policy "Anyone reads active menu products"
  on public.menu_products for select to anon, authenticated
  using (active or (select public.is_menu_admin(store_id)));
create policy "Owner creates menu products for their store"
  on public.menu_products for insert to authenticated
  with check ((select public.is_menu_admin(store_id)));
create policy "Owner updates menu products for their store"
  on public.menu_products for update to authenticated
  using ((select public.is_menu_admin(store_id))) with check ((select public.is_menu_admin(store_id)));
create policy "Owner removes menu products for their store"
  on public.menu_products for delete to authenticated
  using ((select public.is_menu_admin(store_id)));

insert into public.stores (slug, name) values ('la-josefina', 'La Josefina');

insert into public.menu_sections (store_id, slug, title, description, position)
select store.id, seed.slug, seed.title, seed.description, seed.position
from public.stores as store
cross join (values
  ('lomitos', 'Lomitos', 'Carne tierna, pan calentito y mucho sabor.', 0),
  ('hamburguesas', 'Hamburguesas', 'Hechas para disfrutar hasta el último bocado.', 1),
  ('tostados', 'Tostados', 'Doraditos, abundantes y recién hechos.', 2),
  ('picadas', 'Picadas', 'Para compartir. Papas fritas, milanesas, aceitunas, pan y aderezos.', 3),
  ('milanesas', 'Milanesas', 'Con guarnición de papas fritas.', 4),
  ('sandwiches', 'Sándwiches de milanesa', 'Elegí tu favorito, siempre bien completo.', 5),
  ('pizzas', 'Pizzas', 'Clásicas para cualquier plan.', 6),
  ('empanadas', 'Empanadas', 'Elegí tus gustos favoritos.', 7),
  ('papas', 'Papas fritas', 'Para picar, compartir o no compartir.', 8),
  ('promos', 'Promos', 'Un plan rico, resuelto.', 9)
) as seed(slug, title, description, position)
where store.slug = 'la-josefina';

insert into public.menu_products (store_id, section_slug, name, description, price, kind, position)
select store.id, seed.section_slug, seed.name, seed.description, seed.price, seed.kind, seed.position
from public.stores as store
cross join (values
  ('lomitos', 'Común', 'Mayonesa y queso', 8000, 'dish', 0),
  ('lomitos', 'Especial', 'Lechuga, tomate, jamón, queso, huevo y mayonesa', 10000, 'dish', 1),
  ('lomitos', 'Súper', 'Lechuga, tomate, jamón, queso, huevo, mayonesa y roquefort', 12000, 'dish', 2),
  ('hamburguesas', 'Común', 'Mayonesa y queso', 6000, 'dish', 0),
  ('hamburguesas', 'Especial', 'Lechuga, tomate, jamón, queso, huevo y mayonesa', 8000, 'dish', 1),
  ('hamburguesas', 'Súper', 'Lechuga, tomate, jamón, queso, huevo, mayonesa, roquefort y 2 patys', 13000, 'dish', 2),
  ('tostados', 'Común', 'Triple de jamón y queso', 6000, 'dish', 0),
  ('tostados', 'Especial primavera', 'Jamón, queso, lechuga, tomate, huevo y mayonesa', 7000, 'dish', 1),
  ('picadas', 'Para 2 personas', 'Una picada completa para compartir', 18000, 'dish', 0),
  ('picadas', 'Para 4 personas', 'Una picada completa para compartir', 32000, 'dish', 1),
  ('picadas', 'Súper pancho', '', 3500, 'dish', 2),
  ('milanesas', 'Mila con papas', '', 12000, 'dish', 0),
  ('milanesas', 'Mila napolitana', '', 14000, 'dish', 1),
  ('milanesas', 'Fugazzeta', '', 14000, 'dish', 2),
  ('milanesas', 'Caballo', '', 14000, 'dish', 3),
  ('milanesas', 'Cuatro queso', '', 14000, 'dish', 4),
  ('milanesas', 'Americana', '', 14000, 'dish', 5),
  ('sandwiches', 'Común', 'Lechuga, tomate y mayonesa', 8000, 'dish', 0),
  ('sandwiches', 'Especial', 'Lechuga, tomate, jamón, queso, huevo y mayonesa', 10000, 'dish', 1),
  ('sandwiches', 'De marinera', 'Lechuga, tomate y mayonesa', 8000, 'dish', 2),
  ('pizzas', 'Muzza', '', 10000, 'dish', 0),
  ('pizzas', 'Napolitana', '', 12000, 'dish', 1),
  ('pizzas', 'Calabresa', '', 14000, 'dish', 2),
  ('pizzas', 'Especial', '', 14000, 'dish', 3),
  ('pizzas', 'Roquefort', '', 14000, 'dish', 4),
  ('pizzas', 'Rúcula', '', 14000, 'dish', 5),
  ('pizzas', 'Huevo frito', '', 14000, 'dish', 6),
  ('pizzas', 'La Josefina', '', 15000, 'dish', 7),
  ('empanadas', 'Carne', '', null, 'dish', 0),
  ('empanadas', 'Carne cortada a cuchillo', '', null, 'dish', 1),
  ('empanadas', 'Jamón y queso', '', null, 'dish', 2),
  ('empanadas', 'Cebolla y queso', '', null, 'dish', 3),
  ('empanadas', 'Choclo y queso', '', null, 'dish', 4),
  ('empanadas', 'Acelga y queso', '', null, 'dish', 5),
  ('empanadas', 'Pollo', '', null, 'dish', 6),
  ('empanadas', 'Capresse', '', null, 'dish', 7),
  ('empanadas', 'Roquefort', '', null, 'dish', 8),
  ('empanadas', 'La docena', '', 14000, 'price_option', 9),
  ('empanadas', 'Unidad', '', 1200, 'price_option', 10),
  ('empanadas', '20 surtidas', '', 20000, 'price_option', 11),
  ('papas', 'Papas fritas', '', 7000, 'dish', 0),
  ('papas', 'Papas americanas', '', 10000, 'dish', 1),
  ('papas', 'Salchipapas', '', 10000, 'dish', 2),
  ('papas', 'Hamburpapas', '', 10000, 'dish', 3),
  ('papas', 'Lomipapas', '', 10000, 'dish', 4),
  ('promos', '2 hamburguesas especiales + papas', '', 14000, 'dish', 0),
  ('promos', '2 lomitos especiales + papas', '', 18000, 'dish', 1),
  ('promos', '2 sándwiches de mila especiales + papas', '', 18000, 'dish', 2),
  ('promos', '2 milanesas con papas', '', 20000, 'dish', 3),
  ('promos', '1 pizza + 6 empanadas + papas', '', 20000, 'dish', 4),
  ('promos', '2 pizzas muzza', '', 18000, 'dish', 5),
  ('promos', '20 empanadas surtidas', '', 20000, 'dish', 6),
  ('promos', '20 empanadas a elección', '', 20000, 'dish', 7),
  ('promos', '2 panchos + 2 vasitos de Coca', '', 6000, 'dish', 8)
) as seed(section_slug, name, description, price, kind, position)
where store.slug = 'la-josefina';
