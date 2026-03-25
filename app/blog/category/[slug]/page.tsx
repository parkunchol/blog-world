import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { PostCard } from "@/components/PostCard";
import {
  AI_SCIENCE_CATEGORY_SLUG,
  getPublishedPostsByCategorySlug,
} from "@/lib/posts";
import { getCategoryBySlug } from "@/lib/taxonomy";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cat = await getCategoryBySlug(slug);
  if (!cat) return { title: "카테고리" };
  return { title: `${cat.name} 글` };
}

export default async function BlogCategoryPage({ params }: Props) {
  const { slug } = await params;
  if (slug === AI_SCIENCE_CATEGORY_SLUG) {
    redirect("/ai-science");
  }
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const posts = await getPublishedPostsByCategorySlug(category.slug);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <header className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4 shadow-sm sm:px-6">
        <Link
          href="/blog"
          className="text-sm text-[var(--text-muted)] hover:text-[var(--accent)]"
        >
          ← 전체 글
        </Link>
        <h1 className="mt-2 text-xl font-bold text-[var(--text)] sm:text-2xl">
          카테고리: {category.name}
        </h1>
        <p className="mt-1 font-mono text-xs text-[var(--text-muted)]">
          /{category.slug}
        </p>
      </header>

      {posts.length === 0 ? (
        <p className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface)] px-4 py-12 text-center text-sm text-[var(--text-muted)]">
          이 카테고리의 발행 글이 없습니다.
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
