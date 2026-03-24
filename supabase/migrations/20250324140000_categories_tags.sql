-- 카테고리·태그·글-태그 연결 + posts.category_id

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create index if not exists categories_slug_idx on public.categories (slug);
create index if not exists tags_slug_idx on public.tags (slug);

alter table public.posts
  add column if not exists category_id uuid references public.categories (id) on delete set null;

create index if not exists posts_category_id_idx on public.posts (category_id);

create table if not exists public.post_tags (
  post_id uuid not null references public.posts (id) on delete cascade,
  tag_id uuid not null references public.tags (id) on delete cascade,
  primary key (post_id, tag_id)
);

create index if not exists post_tags_tag_id_idx on public.post_tags (tag_id);

-- RLS
alter table public.categories enable row level security;
alter table public.tags enable row level security;
alter table public.post_tags enable row level security;

drop policy if exists "Anyone can read categories" on public.categories;
drop policy if exists "Anon can insert categories" on public.categories;

create policy "Anyone can read categories"
  on public.categories
  for select
  using (true);

create policy "Anon can insert categories"
  on public.categories
  for insert
  to anon
  with check (true);

drop policy if exists "Anyone can read tags" on public.tags;
drop policy if exists "Anon can insert tags" on public.tags;

create policy "Anyone can read tags"
  on public.tags
  for select
  using (true);

create policy "Anon can insert tags"
  on public.tags
  for insert
  to anon
  with check (true);

drop policy if exists "Read post_tags for published posts" on public.post_tags;
drop policy if exists "Anon can link post_tags" on public.post_tags;

create policy "Read post_tags for published posts"
  on public.post_tags
  for select
  using (
    exists (
      select 1
      from public.posts p
      where p.id = post_tags.post_id
        and p.published = true
    )
  );

-- 글 작성 자동화(Make 등): 글 생성 후 태그 연결
create policy "Anon can link post_tags"
  on public.post_tags
  for insert
  to anon
  with check (true);
