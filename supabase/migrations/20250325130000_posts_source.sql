-- posts 출처 표시 + create_blog_bundle 에 source 반영

alter table public.posts
  add column if not exists source text;

comment on column public.posts.source is '출처(기사 매체명, URL 일부 등). 선택';

create or replace function public.create_blog_bundle(payload jsonb)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cat_id uuid;
  v_post_id uuid;
  t jsonb;
  v_tag_id uuid;
  v_cat jsonb;
begin
  if payload is null then
    raise exception 'payload required';
  end if;

  v_cat := payload->'category';
  if v_cat is not null
     and jsonb_typeof(v_cat) = 'object'
     and coalesce(trim(v_cat->>'slug'), '') <> '' then
    insert into public.categories (name, slug)
    values (
      coalesce(nullif(trim(v_cat->>'name'), ''), v_cat->>'slug'),
      lower(trim(v_cat->>'slug'))
    )
    on conflict (slug) do update
      set name = excluded.name
    returning id into v_cat_id;
  end if;

  insert into public.posts (title, content, slug, excerpt, published, category_id, source)
  values (
    payload->>'title',
    coalesce(payload->>'content', ''),
    payload->>'slug',
    nullif(trim(payload->>'excerpt'), ''),
    coalesce((payload->>'published')::boolean, true),
    v_cat_id,
    nullif(trim(payload->>'source'), '')
  )
  returning id into v_post_id;

  for t in
    select * from jsonb_array_elements(coalesce(payload->'tags', '[]'::jsonb))
  loop
    continue when jsonb_typeof(t) <> 'object';
    continue when coalesce(trim(t->>'slug'), '') = '';

    insert into public.tags (name, slug)
    values (
      coalesce(nullif(trim(t->>'name'), ''), t->>'slug'),
      lower(trim(t->>'slug'))
    )
    on conflict (slug) do update
      set name = excluded.name
    returning id into v_tag_id;

    insert into public.post_tags (post_id, tag_id)
    values (v_post_id, v_tag_id)
    on conflict do nothing;
  end loop;

  return v_post_id;
end;
$$;

comment on function public.create_blog_bundle(jsonb) is
  'JSON payload: title, content, slug, excerpt?, published?, source?, category?:{name,slug}, tags?:[{name,slug}]. Returns new post id.';
