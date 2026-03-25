import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PostSourceFooter, SourceText } from "@/components/PostSource";
import { getPublishedPostById } from "@/lib/posts";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(iso));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const post = await getPublishedPostById(id);
  if (!post) return { title: "글을 찾을 수 없음" };
  return {
    title: post.title,
    description: post.excerpt?.trim() || undefined,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { id } = await params;
  const post = await getPublishedPostById(id);
  if (!post) notFound();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <Link
        href="/blog"
        className="text-sm text-[var(--text-muted)] hover:text-[var(--accent)]"
      >
        ← 글 목록
      </Link>

      <article className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-8 shadow-sm sm:px-8">
        <header className="space-y-3 border-b border-[var(--border)] pb-6">
          <time
            dateTime={post.created_at}
            className="block text-sm text-[var(--text-muted)]"
          >
            {formatDate(post.created_at)}
          </time>
          <div className="flex flex-wrap items-center gap-2">
            {post.category ? (
              <Link
                href={`/blog/category/${encodeURIComponent(post.category.slug)}`}
                className="rounded-full bg-[var(--surface-muted)] px-3 py-1 text-xs font-medium text-[var(--text)] hover:bg-[var(--accent)]/15 hover:text-[var(--accent)]"
              >
                {post.category.name}
              </Link>
            ) : null}
            {post.tags.map((t) => (
              <Link
                key={t.id}
                href={`/blog/tag/${encodeURIComponent(t.slug)}`}
                className="rounded-md border border-[var(--border)] px-2.5 py-1 text-xs text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
              >
                {t.name}
              </Link>
            ))}
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text)] sm:text-3xl">
            {post.title}
          </h1>
          <p className="font-mono text-xs text-[var(--text-muted)]">
            /{post.slug}
          </p>
        </header>

        <div className="mt-8 whitespace-pre-wrap text-base leading-relaxed text-[var(--text)]">
          {post.content}
        </div>
        {post.source?.trim() ? (
          <PostSourceFooter source={post.source} />
        ) : null}
      </article>
    </main>
  );
}
