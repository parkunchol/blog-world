import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * 쿠키 없이 anon만 사용. unstable_cache 내부에서 사용 (Next 권장: 캐시 콜백 안에서는 cookies() 지양).
 * 발행 글·분류 등 RLS로 anon 읽기 가능한 쿼리만.
 */
export function createPublicSupabaseClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}
