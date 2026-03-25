-- RSS·DART 일일 수집 백업용 (메타만, 본문/PDF 없음)
-- GitHub Actions 등은 service_role 키로 INSERT. 앱(anon)은 읽기만.
--
-- rss_items: 출처는 feed_id 로 구분 (연합 마켓/경제, 인포맥스 등). 별도 source 컬럼은 두지 않음.

create table if not exists public.rss_items (
  id uuid primary key default gen_random_uuid(),
  feed_id text not null,
  external_id text not null,
  url text not null,
  title text not null,
  published_at timestamptz not null,
  stock_codes text[] not null default '{}',
  ingested_at timestamptz not null default now(),
  constraint rss_items_feed_external_unique unique (feed_id, external_id)
);

comment on column public.rss_items.stock_codes is
  '제목·요약·본문·URL에서 추출한 6자리 종목코드(중복 제거·정렬)';

create index if not exists rss_items_published_at_desc_idx
  on public.rss_items (published_at desc);

create index if not exists rss_items_feed_id_published_at_idx
  on public.rss_items (feed_id, published_at desc);

create index if not exists rss_items_stock_codes_gin_idx
  on public.rss_items using gin (stock_codes);

create table if not exists public.dart_filings (
  id uuid primary key default gen_random_uuid(),
  rcept_no text not null,
  rcept_dt date not null,
  corp_code text not null,
  corp_name text,
  report_nm text not null,
  stock_code text,
  url text not null,
  ingested_at timestamptz not null default now(),
  constraint dart_filings_rcept_no_unique unique (rcept_no)
);

comment on column public.dart_filings.url is
  '금융감독원 DART 공시 뷰어 (접수번호 rcpNo 기준)';

create index if not exists dart_filings_rcept_dt_desc_idx
  on public.dart_filings (rcept_dt desc);

create index if not exists dart_filings_corp_rcept_dt_idx
  on public.dart_filings (corp_code, rcept_dt desc);

create index if not exists dart_filings_stock_code_rcept_dt_idx
  on public.dart_filings (stock_code, rcept_dt desc)
  where stock_code is not null;

alter table public.rss_items enable row level security;
alter table public.dart_filings enable row level security;

-- 읽기: 공개 앱(anon) / 로그인 사용자 — INSERT는 정책 없음 → service_role만 가능
drop policy if exists "Anyone can read rss_items" on public.rss_items;
create policy "Anyone can read rss_items"
  on public.rss_items
  for select
  using (true);

drop policy if exists "Anyone can read dart_filings" on public.dart_filings;
create policy "Anyone can read dart_filings"
  on public.dart_filings
  for select
  using (true);
