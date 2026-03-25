"use client";

import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { TaxonomyItem } from "@/lib/taxonomy";

const navClass =
  "block whitespace-nowrap rounded-lg px-3 py-2 text-sm text-[var(--text-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--text)]";

export function BlogSidebar({
  user,
  categories,
  tags,
}: {
  user: User | null;
  categories: TaxonomyItem[];
  tags: TaxonomyItem[];
}) {
  const pathname = usePathname();
  const showBlogTaxonomy =
    pathname === "/tech" || pathname.startsWith("/blog");

  const label =
    user?.user_metadata?.full_name ??
    user?.user_metadata?.name ??
    user?.email?.split("@")[0] ??
    null;

  return (
    <div className="space-y-3 lg:sticky lg:top-16">
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
          moa.me
        </p>
        <p className="mt-1 text-lg font-bold text-[var(--text)]">허브</p>
        {showBlogTaxonomy ? (
          <p className="mt-1 text-xs leading-relaxed text-[var(--text-muted)]">
            이 구간:{" "}
            <span className="font-medium text-[var(--text)]">
              Tech Crunch Blog
            </span>
          </p>
        ) : (
          <p className="mt-1 text-xs leading-relaxed text-[var(--text-muted)]">
            주식 · 테크 · 순위정보
          </p>
        )}
        <div className="mt-4 border-t border-[var(--border)] pt-4">
          {user ? (
            <>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--surface-muted)] text-sm font-semibold text-[var(--accent)]">
                {(label ?? "?").slice(0, 1).toUpperCase()}
              </div>
              <p className="mt-2 text-sm font-medium text-[var(--text)]">
                {label ?? "회원"}
              </p>
              {user.email ? (
                <p className="mt-0.5 truncate text-xs text-[var(--text-muted)]">
                  {user.email}
                </p>
              ) : null}
            </>
          ) : (
            <>
              <p className="text-sm text-[var(--text-muted)]">
                로그인하면 프로필이 여기에 표시됩니다.
              </p>
              <Link
                href="/auth/login"
                className="mt-3 inline-flex w-full items-center justify-center rounded-lg bg-[var(--accent)] py-2.5 text-sm font-medium text-white hover:opacity-90"
              >
                로그인
              </Link>
            </>
          )}
        </div>
      </div>

      <nav className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2 shadow-sm lg:block">
        <ul className="flex flex-row gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
          <li>
            <Link href="/" className={navClass}>
              홈
            </Link>
          </li>
          <li>
            <Link href="/stocks" className={navClass}>
              주식
            </Link>
          </li>
          <li>
            <Link href="/tech" className={navClass}>
              테크
            </Link>
          </li>
          <li>
            <Link href="/rankings" className={navClass}>
              순위정보
            </Link>
          </li>
          <li>
            <Link
              href="/auth/login"
              className={`${navClass} lg:hidden`}
            >
              {user ? "계정" : "로그인"}
            </Link>
          </li>
        </ul>
      </nav>

      {showBlogTaxonomy && categories.length > 0 ? (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-sm">
          <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
            카테고리
          </p>
          <ul className="flex max-h-48 flex-col gap-0.5 overflow-y-auto lg:max-h-none">
            {categories.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/blog/category/${encodeURIComponent(c.slug)}`}
                  className="block rounded-lg px-2 py-1.5 text-sm text-[var(--text-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--accent)]"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {showBlogTaxonomy && tags.length > 0 ? (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-sm">
          <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
            태그
          </p>
          <ul className="flex max-h-52 flex-wrap gap-1.5 overflow-y-auto lg:max-h-none">
            {tags.map((t) => (
              <li key={t.id}>
                <Link
                  href={`/blog/tag/${encodeURIComponent(t.slug)}`}
                  className="inline-block rounded-md border border-[var(--border)] bg-[var(--surface-muted)] px-2 py-1 text-xs text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
                >
                  {t.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
