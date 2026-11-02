-- ADAPTO · Esquema Neon (Postgres)
-- Ejecutar completo en el SQL Editor de Neon o con `npm run db:schema`.
-- Es idempotente: se puede correr más de una vez.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Catálogo: categorías → subcategorías → productos
-- ---------------------------------------------------------------------------

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  color text not null default 'pink', -- purple | pink | green | yellow | teal
  visible boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists subcategories (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references categories(id) on delete cascade,
  slug text not null unique,
  name text not null,
  long_name text,
  detail text,
  color text not null default 'purple',
  icon text,
  visible boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists subcategories_category_idx on subcategories(category_id, sort_order);

-- previews: array JSON con las páginas que se muestran en el carrusel,
--   la primera es la portada: [{ "url": "https://res.cloudinary.com/...", "alt": "Página 1" }]
-- price: en pesos, sin decimales
-- audiences: 'ninos' | 'adolescentes' | 'adultos'
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  short_description text,
  description text,
  price integer not null default 0 check (price >= 0),
  compare_at_price integer check (compare_at_price is null or compare_at_price >= 0),
  category_id uuid not null references categories(id) on delete restrict,
  subcategory_id uuid references subcategories(id) on delete set null,
  previews jsonb not null default '[]'::jsonb,
  page_count integer,
  format text not null default 'PDF',
  audiences text[] not null default '{}',
  featured boolean not null default false,
  visible boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_public_idx on products(visible, sort_order);
create index if not exists products_category_idx on products(category_id);
create index if not exists products_subcategory_idx on products(subcategory_id);

-- Categorías y subcategorías iniciales
insert into categories (slug, name, color, sort_order) values
  ('actividades', 'Actividades', 'pink', 1),
  ('guias', 'Guías', 'teal', 2)
on conflict (slug) do nothing;

insert into subcategories (category_id, slug, name, long_name, detail, color, icon, sort_order)
select c.id, s.slug, s.name, s.long_name, s.detail, s.color, s.icon, s.sort_order
from (values
  ('actividades', 'escritura', 'Escritura', null, null, 'purple', 'escritura', 1),
  ('actividades', 'motricidad-fina', 'Motricidad fina', null, null, 'pink', 'motricidad', 2),
  ('actividades', 'avd', 'AVD', 'Actividades de la vida diaria', 'Alimentación, higiene y cuidado personal, descanso y sueño', 'green', 'avd', 3),
  ('actividades', 'avdi', 'AVDI', 'Actividades instrumentales', 'Manejo del dinero', 'yellow', 'dinero', 4),
  ('actividades', 'autorregulacion', 'Autorregulación y emociones', 'Autorregulación y gestión de emociones', null, 'teal', 'emociones', 5),
  ('actividades', 'estimulacion-cognitiva', 'Estimulación cognitiva', null, null, 'purple', 'cognitiva', 6),
  ('actividades', 'rutinas', 'Rutinas', null, null, 'pink', 'rutinas', 7),
  ('guias', 'seguimiento-terapeutico', 'Seguimiento terapéutico', null, null, 'green', 'seguimiento', 8)
) as s(category_slug, slug, name, long_name, detail, color, icon, sort_order)
join categories c on c.slug = s.category_slug
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- Admin (para el panel que viene): usuarios, sesiones y bloqueo de login
-- ---------------------------------------------------------------------------

create table if not exists admin_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text,
  password_hash text,
  role text not null default 'admin',
  active boolean not null default true,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists admin_users_email_unique_idx on admin_users(lower(email));

create table if not exists admin_sessions (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid not null references admin_users(id) on delete cascade,
  session_token_hash text not null unique,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists admin_sessions_user_idx on admin_sessions(admin_user_id);

create table if not exists admin_login_attempts (
  key_hash text primary key,
  failures integer not null default 0,
  locked_until timestamptz,
  updated_at timestamptz not null default now()
);
