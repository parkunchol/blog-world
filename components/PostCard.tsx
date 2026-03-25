import Link from "next/link";
import { SourceText } from "@/components/PostSource";
import { stripSourceArtifactsFromContent } from "@/lib/post-content";
import { resolveExternalArticleUrl } from "@/lib/post-source";
import { AI_SCIENCE_CATEGORY_SLUG, type Post } from "@/lib/posts";

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export function PostCard({ post, href }: { post: Post; href: string }) {
  const rawExcerpt = post.excerpt?.trim();
  const cleaned = stripSourceArtifactsFromContent(post.content);
  const preview =
    rawExcerpt ??
    (cleaned.length > 160 ? `${cleaned.slice(0, 160)}…` : cleaned);

  const articleUrl = resolveExternalArticleUrl(post);

  return (
    <article className="group border-b border-[var(--border)] py-5 last:border-b-0">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[var(--text-muted)]">
          <time dateTime={post.created_at}>{formatDate(post.created_at)}</time>
          <span className="text-[var(--border)]">·</span>
          <span className="text-[var(--accent)]">발행</span>
          {post.category ? (
            <>
              <span className="text-[var(--border)]">·</span>
              <Link
                href={
                  post.category.slug === AI_SCIENCE_CATEGORY_SLUG
                    ? "/ai-science"
                    : `/blog/category/${encodeURIComponent(post.category.slug)}`
                }
                className="rounded-full bg-[var(--surface-muted)] px-2 py-0.5 font-medium text-[var(--text)] hover:bg-[var(--accent)]/15 hover:text-[var(--accent)]"
              >
                {post.category.name}
              </Link>
            </>
          ) : null}
          {articleUrl || post.source?.trim() ? (
            <>
              <span className="text-[var(--border)]">·</span>
              <span className="inline-flex min-w-0 max-w-full items-baseline gap-1 text-[var(--text-muted)]">
                {articleUrl ? (
                  <SourceText source={articleUrl} />
                ) : (
                  <>
                    <span>출처</span>
                    <SourceText
                      source={post.source ?? ""}
                      className="inline-block max-w-[min(100%,14rem)] truncate align-bottom"
                    />
                  </>
                )}
              </span>
            </>
          ) : null}
        </div>
        {post.tags.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {post.tags.map((t) => (
              <Link
                key={t.id}
                href={`/blog/tag/${encodeURIComponent(t.slug)}`}
                className="rounded-md border border-[var(--border)] bg-[var(--surface-muted)] px-2 py-0.5 text-[11px] text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
              >
                {t.name}
              </Link>
            ))}
          </div>
        ) : null}
        <Link href={href} className="block space-y-2">
          <h2 className="text-lg font-semibold text-[var(--text)] group-hover:text-[var(--accent)] sm:text-xl">
            {post.title}
          </h2>
          <p className="line-clamp-2 text-sm leading-relaxed text-[var(--text-muted)] sm:line-clamp-3">
            {preview}
          </p>
          <span className="inline-block text-xs font-medium text-[var(--accent)]">
            글 읽기 →
          </span>
        </Link>
      </div>
    </article>
  );
}
