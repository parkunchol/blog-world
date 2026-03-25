import { unstable_cache } from "next/cache";
import { CACHE_REVALIDATE_SECONDS } from "@/lib/cache-config";
import { createPublicSupabaseClient } from "@/lib/supabase/public";

export type Category = {
  id: string;
  name: string;
  slug: string;
};

export type Tag = {
  id: string;
  name: string;
  slug: string;
};

export type Post = {
  id: string;
  title: string;
  content: string;
  slug: string;
  excerpt: string | null;
  source: string | null;
  /** RSS 원문 등 — source가 문자열이어도 외부 링크로 쓸 수 있음 */
  external_url: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
  category_id: string | null;
  category: Category | null;
  tags: Tag[];
};

type CategoryRow = { id: string; name: string; slug: string };
type TagRow = { id: string; name: string; slug: string };
type PostTagRow = { tags: TagRow | TagRow[] | null } | null;

type PostQueryRow = {
  id: string;
  title: string;
  content: string;
  slug: string;
  excerpt: string | null;
  source: string | null;
  external_url: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
  category_id: string | null;
  category?: CategoryRow | CategoryRow[] | null;
  categories?: CategoryRow | CategoryRow[] | null;
  post_tags: PostTagRow[] | null;
};

function pickCategory(
  c: CategoryRow | CategoryRow[] | null,
): CategoryRow | null {
  if (c == null) return null;
  if (Array.isArray(c)) return c[0] ?? null;
  return c;
}

function flattenTagsFromPostTags(rows: PostTagRow[] | null): TagRow[] {
  if (!rows?.length) return [];
  const out: TagRow[] = [];
  for (const pt of rows) {
    const t = pt?.tags;
    if (t == null) continue;
    if (Array.isArray(t)) out.push(...t.filter(Boolean));
    else out.push(t);
  }
  return out;
}

function normalizePost(row: PostQueryRow): Post {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    slug: row.slug,
    excerpt: row.excerpt,
    source: row.source ?? null,
    external_url: row.external_url ?? null,
    published: row.published,
    created_at: row.created_at,
    updated_at: row.updated_at,
    category_id: row.category_id,
    category: pickCategory(row.category ?? row.categories ?? null),
    tags: flattenTagsFromPostTags(row.post_tags),
  };
}

/** RSS AI·과학 ingest (`create_blog_bundle`)와 동일 slug */
export const AI_SCIENCE_CATEGORY_SLUG = "ai-science";

const postSelect = `
  id,
  title,
  content,
  slug,
  excerpt,
  source,
  external_url,
  published,
  created_at,
  updated_at,
  category_id,
  category:categories ( id, name, slug ),
  post_tags ( tags ( id, name, slug ) )
`;

const cacheOpts = {
  revalidate: CACHE_REVALIDATE_SECONDS,
  tags: ["blog-posts"] as string[],
};

export async function getPublishedPosts(limit?: number): Promise<Post[]> {
  return unstable_cache(
    async () => {
      const supabase = createPublicSupabaseClient();
      if (!supabase) return [];

      let q = supabase
        .from("posts")
        .select(postSelect)
        .eq("published", true)
        .order("created_at", { ascending: false });

      if (limit != null) q = q.limit(limit);

      const { data, error } = await q;
      if (error) throw error;
      const rows = (data ?? []) as unknown as PostQueryRow[];
      return rows.map(normalizePost);
    },
    ["blog", "posts", "list", String(limit ?? "all")],
    cacheOpts,
  )();
}

/** 메인 글 목록용: 지정 카테고리(예: AI·과학 RSS) 글은 제외 */
export async function getPublishedPostsExcludingCategorySlug(
  excludeSlug: string,
  limit?: number,
): Promise<Post[]> {
  return unstable_cache(
    async () => {
      const supabase = createPublicSupabaseClient();
      if (!supabase) return [];

      const { data: cat, error: catErr } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", excludeSlug)
        .maybeSingle();

      if (catErr) throw catErr;

      let q = supabase
        .from("posts")
        .select(postSelect)
        .eq("published", true)
        .order("created_at", { ascending: false });

      if (cat?.id) {
        q = q.or(`category_id.is.null,category_id.neq.${cat.id}`);
      }

      if (limit != null) q = q.limit(limit);

      const { data, error } = await q;
      if (error) throw error;
      const rows = (data ?? []) as unknown as PostQueryRow[];
      return rows.map(normalizePost);
    },
    [
      "blog",
      "posts",
      "list",
      "exclude",
      excludeSlug,
      String(limit ?? "all"),
    ],
    cacheOpts,
  )();
}

export async function getPublishedPostById(id: string): Promise<Post | null> {
  return unstable_cache(
    async () => {
      const supabase = createPublicSupabaseClient();
      if (!supabase) return null;

      const { data, error } = await supabase
        .from("posts")
        .select(postSelect)
        .eq("id", id)
        .eq("published", true)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;
      return normalizePost(data as unknown as PostQueryRow);
    },
    ["blog", "posts", "by-id", id],
    cacheOpts,
  )();
}

export async function getPublishedPostsByCategorySlug(
  slug: string,
): Promise<Post[]> {
  return unstable_cache(
    async () => {
      const supabase = createPublicSupabaseClient();
      if (!supabase) return [];

      const { data: cat, error: catErr } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();

      if (catErr) throw catErr;
      if (!cat) return [];

      const { data, error } = await supabase
        .from("posts")
        .select(postSelect)
        .eq("published", true)
        .eq("category_id", cat.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      const rows = (data ?? []) as unknown as PostQueryRow[];
      return rows.map(normalizePost);
    },
    ["blog", "posts", "by-category", slug],
    cacheOpts,
  )();
}

export async function getPublishedPostsByTagSlug(
  slug: string,
): Promise<Post[]> {
  return unstable_cache(
    async () => {
      const supabase = createPublicSupabaseClient();
      if (!supabase) return [];

      const { data: tag, error: tagErr } = await supabase
        .from("tags")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();

      if (tagErr) throw tagErr;
      if (!tag) return [];

      const { data: links, error: linkErr } = await supabase
        .from("post_tags")
        .select("post_id")
        .eq("tag_id", tag.id);

      if (linkErr) throw linkErr;
      const postIds = [...new Set((links ?? []).map((l) => l.post_id))];
      if (postIds.length === 0) return [];

      const { data, error } = await supabase
        .from("posts")
        .select(postSelect)
        .eq("published", true)
        .in("id", postIds)
        .order("created_at", { ascending: false });

      if (error) throw error;
      const rows = (data ?? []) as unknown as PostQueryRow[];
      return rows.map(normalizePost);
    },
    ["blog", "posts", "by-tag", slug],
    cacheOpts,
  )();
}
