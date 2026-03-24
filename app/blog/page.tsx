import type { Metadata } from "next";
import { PostCard } from "@/components/PostCard";
import { getPublishedPosts } from "@/lib/posts";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "글 목록",
};

export default async function BlogIndexPage() {
  const posts = await getPublishedPosts();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <header className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4 shadow-sm sm:px-6">
        <h1 className="text-xl font-bold text-[var(--text)] sm:text-2xl">
          글 목록
        </h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          최신순 · 발행된 글만 표시
        </p>
      </header>

      {posts.length === 0 ? (
        <p className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface)] px-4 py-12 text-center text-sm text-[var(--text-muted)]">
          게시된 글이 없습니다.
        </p>
      ) : (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 shadow-sm sm:px-5">
          <ul>
            {posts.map((post) => (
              <li key={post.id}>
                <PostCard post={post} href={`/blog/${post.id}`} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}
