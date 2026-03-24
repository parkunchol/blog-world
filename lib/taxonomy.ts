import { unstable_cache } from "next/cache";
import { CACHE_REVALIDATE_SECONDS } from "@/lib/cache-config";
import { createPublicSupabaseClient } from "@/lib/supabase/public";

export type TaxonomyItem = {
  id: string;
  name: string;
  slug: string;
};

const taxonomyCacheOpts = {
  revalidate: CACHE_REVALIDATE_SECONDS,
  tags: ["blog-taxonomy"] as string[],
};

export async function getAllCategories(): Promise<TaxonomyItem[]> {
  return unstable_cache(
    async () => {
      const supabase = createPublicSupabaseClient();
      if (!supabase) return [];

      const { data, error } = await supabase
        .from("categories")
        .select("id, name, slug")
        .order("name");

      if (error) throw error;
      return (data ?? []) as TaxonomyItem[];
    },
    ["blog", "taxonomy", "categories", "all"],
    taxonomyCacheOpts,
  )();
}

export async function getAllTags(): Promise<TaxonomyItem[]> {
  return unstable_cache(
    async () => {
      const supabase = createPublicSupabaseClient();
      if (!supabase) return [];

      const { data, error } = await supabase
        .from("tags")
        .select("id, name, slug")
        .order("name");

      if (error) throw error;
      return (data ?? []) as TaxonomyItem[];
    },
    ["blog", "taxonomy", "tags", "all"],
    taxonomyCacheOpts,
  )();
}

export async function getCategoryBySlug(
  slug: string,
): Promise<TaxonomyItem | null> {
  return unstable_cache(
    async () => {
      const supabase = createPublicSupabaseClient();
      if (!supabase) return null;

      const { data, error } = await supabase
        .from("categories")
        .select("id, name, slug")
        .eq("slug", slug)
        .maybeSingle();

      if (error) throw error;
      return data as TaxonomyItem | null;
    },
    ["blog", "taxonomy", "category", slug],
    taxonomyCacheOpts,
  )();
}

export async function getTagBySlug(slug: string): Promise<TaxonomyItem | null> {
  return unstable_cache(
    async () => {
      const supabase = createPublicSupabaseClient();
      if (!supabase) return null;

      const { data, error } = await supabase
        .from("tags")
        .select("id, name, slug")
        .eq("slug", slug)
        .maybeSingle();

      if (error) throw error;
      return data as TaxonomyItem | null;
    },
    ["blog", "taxonomy", "tag", slug],
    taxonomyCacheOpts,
  )();
}
