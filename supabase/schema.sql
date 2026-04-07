-- ============================================================
-- ENUMS
-- ============================================================

create type user_role as enum ('admin', 'creator');
create type campaign_status as enum ('draft', 'live', 'closed', 'fulfilled');
create type fulfillment_type as enum ('pickup', 'delivery');
create type order_status as enum ('pending', 'fulfilled');


-- ============================================================
-- PROFILES
-- Extends auth.users. Created by admin for creators;
-- admin profile created manually after first auth sign-in.
-- ============================================================

create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  role        user_role not null,
  full_name   text not null,
  email       text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);


-- ============================================================
-- CATALOG
-- ============================================================

create table products (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text,
  base_price  numeric(10,2) not null,
  active      boolean not null default true,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

create table colors (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  hex_code    text,
  sort_order  int not null default 0
);

create table sizes (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,           -- XS, S, M, L, XL, 2XL, One Size, etc.
  sort_order  int not null default 0
);

create table placements (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,           -- Front, Back, Left Chest, etc.
  sort_order  int not null default 0
);

-- Which colors are available for a product
create table product_colors (
  product_id  uuid not null references products(id) on delete cascade,
  color_id    uuid not null references colors(id) on delete cascade,
  primary key (product_id, color_id)
);

-- Which sizes are available for a product
create table product_sizes (
  product_id  uuid not null references products(id) on delete cascade,
  size_id     uuid not null references sizes(id) on delete cascade,
  primary key (product_id, size_id)
);

-- Which placements are available for a product
create table product_placements (
  product_id    uuid not null references products(id) on delete cascade,
  placement_id  uuid not null references placements(id) on delete cascade,
  primary key (product_id, placement_id)
);

-- Mockup images per product + color combo
create table mockup_images (
  id            uuid primary key default gen_random_uuid(),
  product_id    uuid not null references products(id) on delete cascade,
  color_id      uuid references colors(id) on delete set null,
  storage_path  text not null,
  alt_text      text,
  sort_order    int not null default 0,
  created_at    timestamptz not null default now()
);


-- ============================================================
-- CAMPAIGNS
-- ============================================================

create table campaigns (
  id            uuid primary key default gen_random_uuid(),
  creator_id    uuid not null references profiles(id) on delete restrict,
  title         text not null,
  slug          text not null unique,
  description   text,
  status        campaign_status not null default 'draft',
  deadline      timestamptz,
  published_at  timestamptz,
  closed_at     timestamptz,
  fulfilled_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Products selected for a campaign (admin can set price override)
create table campaign_products (
  id              uuid primary key default gen_random_uuid(),
  campaign_id     uuid not null references campaigns(id) on delete cascade,
  product_id      uuid not null references products(id) on delete restrict,
  price_override  numeric(10,2),   -- null = use product base_price
  unique (campaign_id, product_id)
);

-- Colors selected for a campaign product
create table campaign_product_colors (
  campaign_product_id  uuid not null references campaign_products(id) on delete cascade,
  color_id             uuid not null references colors(id) on delete restrict,
  primary key (campaign_product_id, color_id)
);

-- Design files uploaded per campaign product + placement (one file per slot)
create table campaign_designs (
  id                   uuid primary key default gen_random_uuid(),
  campaign_product_id  uuid not null references campaign_products(id) on delete cascade,
  placement_id         uuid not null references placements(id) on delete restrict,
  storage_path         text not null,
  file_name            text not null,
  uploaded_at          timestamptz not null default now(),
  unique (campaign_product_id, placement_id)
);


-- ============================================================
-- ORDERS
-- ============================================================

create table orders (
  id                uuid primary key default gen_random_uuid(),
  campaign_id       uuid not null references campaigns(id) on delete restrict,
  buyer_name        text not null,
  buyer_email       text not null,
  buyer_phone       text,
  notes             text,
  fulfillment_type  fulfillment_type not null,
  delivery_address  text,
  status            order_status not null default 'pending',
  created_at        timestamptz not null default now()
);

create table order_items (
  id                   uuid primary key default gen_random_uuid(),
  order_id             uuid not null references orders(id) on delete cascade,
  campaign_product_id  uuid not null references campaign_products(id) on delete restrict,
  color_id             uuid references colors(id) on delete restrict,
  size_id              uuid references sizes(id) on delete restrict,   -- nullable for stickers/one-size
  quantity             int not null check (quantity > 0),
  unit_price           numeric(10,2) not null                          -- snapshot at time of order
);


-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Returns true if the current authenticated user is an admin.
-- security definer so it can read profiles bypassing RLS.
create or replace function is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from profiles
    where id = auth.uid()
    and role = 'admin'
  );
$$;

-- Auto-update updated_at on row change
create or replace function update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on profiles
  for each row execute function update_updated_at();

create trigger campaigns_updated_at
  before update on campaigns
  for each row execute function update_updated_at();


-- ============================================================
-- INDEXES
-- ============================================================

create index campaigns_slug_idx        on campaigns(slug);
create index campaigns_creator_id_idx  on campaigns(creator_id);
create index campaigns_status_idx      on campaigns(status);
create index campaign_products_campaign_id_idx on campaign_products(campaign_id);
create index orders_campaign_id_idx    on orders(campaign_id);
create index order_items_order_id_idx  on order_items(order_id);


-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table profiles               enable row level security;
alter table products               enable row level security;
alter table colors                 enable row level security;
alter table sizes                  enable row level security;
alter table placements             enable row level security;
alter table product_colors         enable row level security;
alter table product_sizes          enable row level security;
alter table product_placements     enable row level security;
alter table mockup_images          enable row level security;
alter table campaigns              enable row level security;
alter table campaign_products      enable row level security;
alter table campaign_product_colors enable row level security;
alter table campaign_designs       enable row level security;
alter table orders                 enable row level security;
alter table order_items            enable row level security;

-- PROFILES
create policy "users: view own profile"
  on profiles for select using (auth.uid() = id);
create policy "admins: view all profiles"
  on profiles for select using (is_admin());
create policy "admins: insert profiles"
  on profiles for insert with check (is_admin());
create policy "admins: update profiles"
  on profiles for update using (is_admin());

-- PRODUCTS
create policy "public: view active products"
  on products for select using (active = true);
create policy "admins: manage products"
  on products for all using (is_admin());

-- COLORS
create policy "public: view colors"
  on colors for select using (true);
create policy "admins: manage colors"
  on colors for all using (is_admin());

-- SIZES
create policy "public: view sizes"
  on sizes for select using (true);
create policy "admins: manage sizes"
  on sizes for all using (is_admin());

-- PLACEMENTS
create policy "public: view placements"
  on placements for select using (true);
create policy "admins: manage placements"
  on placements for all using (is_admin());

-- PRODUCT_COLORS
create policy "public: view product_colors"
  on product_colors for select using (true);
create policy "admins: manage product_colors"
  on product_colors for all using (is_admin());

-- PRODUCT_SIZES
create policy "public: view product_sizes"
  on product_sizes for select using (true);
create policy "admins: manage product_sizes"
  on product_sizes for all using (is_admin());

-- PRODUCT_PLACEMENTS
create policy "public: view product_placements"
  on product_placements for select using (true);
create policy "admins: manage product_placements"
  on product_placements for all using (is_admin());

-- MOCKUP_IMAGES
create policy "public: view mockup_images"
  on mockup_images for select using (true);
create policy "admins: manage mockup_images"
  on mockup_images for all using (is_admin());

-- CAMPAIGNS
create policy "public: view live and closed campaigns"
  on campaigns for select using (status in ('live', 'closed', 'fulfilled'));
create policy "creators: view own campaigns"
  on campaigns for select using (auth.uid() = creator_id);
create policy "admins: view all campaigns"
  on campaigns for select using (is_admin());
create policy "creators: insert own campaigns"
  on campaigns for insert with check (auth.uid() = creator_id);
create policy "creators: update own draft campaigns"
  on campaigns for update using (auth.uid() = creator_id and status = 'draft');
create policy "admins: manage all campaigns"
  on campaigns for all using (is_admin());

-- CAMPAIGN_PRODUCTS
create policy "public: view campaign products for public campaigns"
  on campaign_products for select
  using (
    exists (
      select 1 from campaigns c
      where c.id = campaign_id
      and c.status in ('live', 'closed', 'fulfilled')
    )
  );
create policy "creators: manage own campaign products"
  on campaign_products for all
  using (
    exists (
      select 1 from campaigns c
      where c.id = campaign_id
      and c.creator_id = auth.uid()
    )
  );
create policy "admins: manage all campaign products"
  on campaign_products for all using (is_admin());

-- CAMPAIGN_PRODUCT_COLORS
create policy "public: view campaign product colors for public campaigns"
  on campaign_product_colors for select
  using (
    exists (
      select 1 from campaign_products cp
      join campaigns c on c.id = cp.campaign_id
      where cp.id = campaign_product_id
      and c.status in ('live', 'closed', 'fulfilled')
    )
  );
create policy "creators: manage own campaign product colors"
  on campaign_product_colors for all
  using (
    exists (
      select 1 from campaign_products cp
      join campaigns c on c.id = cp.campaign_id
      where cp.id = campaign_product_id
      and c.creator_id = auth.uid()
    )
  );
create policy "admins: manage all campaign product colors"
  on campaign_product_colors for all using (is_admin());

-- CAMPAIGN_DESIGNS
create policy "public: view designs for public campaigns"
  on campaign_designs for select
  using (
    exists (
      select 1 from campaign_products cp
      join campaigns c on c.id = cp.campaign_id
      where cp.id = campaign_product_id
      and c.status in ('live', 'closed', 'fulfilled')
    )
  );
create policy "creators: manage own campaign designs"
  on campaign_designs for all
  using (
    exists (
      select 1 from campaign_products cp
      join campaigns c on c.id = cp.campaign_id
      where cp.id = campaign_product_id
      and c.creator_id = auth.uid()
    )
  );
create policy "admins: manage all campaign designs"
  on campaign_designs for all using (is_admin());

-- ORDERS (anonymous insert allowed on live campaigns)
create policy "public: insert orders for live campaigns"
  on orders for insert
  with check (
    exists (
      select 1 from campaigns c
      where c.id = campaign_id
      and c.status = 'live'
    )
  );
create policy "creators: view orders for own campaigns"
  on orders for select
  using (
    exists (
      select 1 from campaigns c
      where c.id = campaign_id
      and c.creator_id = auth.uid()
    )
  );
create policy "admins: manage all orders"
  on orders for all using (is_admin());

-- ORDER_ITEMS
create policy "public: insert order items"
  on order_items for insert
  with check (
    exists (
      select 1 from orders o
      join campaigns c on c.id = o.campaign_id
      where o.id = order_id
      and c.status = 'live'
    )
  );
create policy "creators: view order items for own campaigns"
  on order_items for select
  using (
    exists (
      select 1 from orders o
      join campaigns c on c.id = o.campaign_id
      where o.id = order_id
      and c.creator_id = auth.uid()
    )
  );
create policy "admins: view all order items"
  on order_items for select using (is_admin());


-- ============================================================
-- NOTES ON SETUP
-- After running this schema:
-- 1. Create the admin user in Supabase Auth dashboard (email+password)
-- 2. Manually insert a row into profiles:
--    insert into profiles (id, role, full_name, email)
--    values ('<auth user uuid>', 'admin', 'Your Name', 'you@example.com');
-- 3. Creator accounts are created by the admin via the app.
-- ============================================================
