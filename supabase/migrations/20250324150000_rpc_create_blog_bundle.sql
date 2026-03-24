-- OpenAI / Make 등에서 JSON 한 덩어리로 글 + 카테고리 + 태그 + post_tags 까지 처리
-- 호출: POST /rest/v1/rpc/create_blog_bundle  Body: { "payload": { ... } }
-- 보안: anon 도 실행 가능 — anon 키 유출 시 악용 가능. 공개 앱이면 나중에 Edge Function + 시크릿 권장.

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

  insert into public.posts (title, content, slug, excerpt, published, category_id)
  values (
    payload->>'title',
    coalesce(payload->>'content', ''),
    payload->>'slug',
    nullif(trim(payload->>'excerpt'), ''),
    coalesce((payload->>'published')::boolean, true),
    v_cat_id
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
  'JSON payload: title, content, slug, excerpt?, published?, category?:{name,slug}, tags?:[{name,slug}]. Returns new post id.';

revoke all on function public.create_blog_bundle(jsonb) from public;
grant execute on function public.create_blog_bundle(jsonb) to anon;
grant execute on function public.create_blog_bundle(jsonb) to authenticated;
grant execute on function public.create_blog_bundle(jsonb) to service_role;
