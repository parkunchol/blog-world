import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import { SignOutButton } from "@/components/SignOutButton";

const link =
  "text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--accent)]";

export function SiteHeader({ user }: { user: User | null }) {
  const short =
    user?.user_metadata?.full_name ??
    user?.user_metadata?.name ??
    user?.email?.split("@")[0];

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-3 sm:px-4 lg:px-6">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <Link
            href="/"
            className="truncate text-base font-bold text-[var(--text)] sm:text-lg"
          >
            Tech Crunch Blog
          </Link>
          <Link href="/blog" className={`${link} shrink-0 sm:hidden`}>
            글목록
          </Link>
          <span className="hidden h-4 w-px bg-[var(--border)] sm:block" />
          <nav className="hidden items-center gap-4 sm:flex">
            <Link href="/" className={link}>
              홈
            </Link>
            <Link href="/blog" className={link}>
              글 목록
            </Link>
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {user ? (
            <>
              <span className="hidden max-w-[8rem] truncate text-xs text-[var(--text-muted)] sm:inline">
                {short ?? "회원"}
              </span>
              <SignOutButton className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--text-muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]" />
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="rounded-lg px-2 py-1.5 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--accent)] sm:text-sm"
              >
                로그인
              </Link>
              <Link
                href="/auth/sign-up"
                className="rounded-lg bg-[var(--accent)] px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 sm:text-sm"
              >
                회원가입
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
