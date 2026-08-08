-- Wishlist Kaboom — schema inicial (lists, items), RLS e trigger de lista padrão.

create table if not exists lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'Minha Wishlist',
  is_default boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists items (
  id uuid primary key default gen_random_uuid(),
  list_id uuid not null references lists(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade, -- redundante de propósito: simplifica policies de RLS
  url text not null,
  title text,
  image_url text,
  price numeric,
  currency text not null default 'BRL',
  status text not null default 'active' check (status in ('active', 'purchased')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists items_list_id_idx on items (list_id);
create index if not exists items_user_id_idx on items (user_id);
create index if not exists lists_user_id_idx on lists (user_id);

alter table lists enable row level security;
alter table items enable row level security;

create policy "own lists" on lists
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "own items" on items
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Cria automaticamente a lista padrão no primeiro login do usuário.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.lists (user_id, name, is_default)
  values (new.id, 'Minha Wishlist', true);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
