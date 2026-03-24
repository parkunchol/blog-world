-- posts 테이블 및 RLS (발행 글 공개 읽기, anon INSERT 허용 — Make.com 등)

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null default '',
  slug text not null unique,
  excerpt text,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists posts_created_at_desc_idx
  on public.posts (created_at desc);

create or replace function public.set_posts_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists posts_set_updated_at on public.posts;
create trigger posts_set_updated_at
  before update on public.posts
  for each row
  execute function public.set_posts_updated_at();

alter table public.posts enable row level security;

drop policy if exists "Anyone can read published posts" on public.posts;
drop policy if exists "Anon can insert posts" on public.posts;

-- 발행된 글은 누구나(anon 포함) SELECT 가능
create policy "Anyone can read published posts"
  on public.posts
  for select
  using (published = true);

-- Make.com 등: anon 키로 INSERT 허용 (필요 시 WITH CHECK 로 조건 강화)
create policy "Anon can insert posts"
  on public.posts
  for insert
  to anon
  with check (true);
