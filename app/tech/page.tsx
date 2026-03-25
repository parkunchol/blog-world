import type { Metadata } from "next";
import Link from "next/link";
import { PostCard } from "@/components/PostCard";
import { getPublishedPosts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "테크",
  description:
    "Tech Crunch 기사 한글화 블로그 — moa.me 테크 코너입니다.",
};

export const dynamic = "force-dynamic";

export default async function TechHomePage() {
  const latest = await getPublishedPosts(3);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-10">
      <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm sm:p-8">
        <p className="text-sm font-medium text-[var(--accent)]">Tech Crunch Blog</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-[var(--text)] sm:text-3xl">
          테크
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-[var(--text-muted)] sm:text-base">
          Tech Crunch에서 제공하는 기사를 한글화하여 제공하는 블로그입니다. moa.me의
          테크 코너입니다.
        </p>
        <Link
          href="/blog"
          className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-[var(--accent)] hover:underline"
        >
          전체 글 보기
          <span aria-hidden>→</span>
        </Link>
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4 border-b border-[var(--border)] pb-3">
          <h2 className="text-lg font-semibold text-[var(--text)]">최신 글</h2>
          <Link
            href="/blog"
            className="text-sm text-[var(--text-muted)] hover:text-[var(--accent)]"
          >
            더보기
          </Link>
        </div>
        {latest.length === 0 ? (
          <p className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface)] px-4 py-10 text-center text-sm text-[var(--text-muted)]">
            아직 표시할 글이 없습니다. Supabase에{" "}
            <code className="rounded bg-[var(--surface-muted)] px-1.5 py-0.5 text-xs">
              published = true
            </code>{" "}
            인 행을 추가해 보세요.
          </p>
        ) : (
          <ul className="flex flex-col sm:gap-3">
            {latest.map((post) => (
              <li key={post.id}>
                <PostCard post={post} href={`/blog/${post.id}`} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
