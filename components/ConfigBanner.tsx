export function ConfigBanner() {
  const missing =
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!missing) return null;

  return (
    <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm text-amber-900">
      Supabase 환경변수가 없습니다. 프로젝트 루트에{" "}
      <code className="rounded bg-white px-1.5 py-0.5 text-xs ring-1 ring-amber-200">
        .env.local
      </code>{" "}
      를 만들고{" "}
      <code className="rounded bg-white px-1.5 py-0.5 text-xs ring-1 ring-amber-200">
        NEXT_PUBLIC_SUPABASE_URL
      </code>
      ,{" "}
      <code className="rounded bg-white px-1.5 py-0.5 text-xs ring-1 ring-amber-200">
        NEXT_PUBLIC_SUPABASE_ANON_KEY
      </code>
      를 설정하세요.
    </div>
  );
}
