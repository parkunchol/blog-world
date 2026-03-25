import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "순위정보",
  description:
    "드라마·영화·음원 등 순위와 화제작 — moa.me 순위정themoa.me비 중).",
};

export default function RankingsPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm sm:p-8">
        <p className="text-sm font-medium text-[var(--accent)]">순위정보</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-[var(--text)] sm:text-3xl">
          순위정보 코너
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-[var(--text-muted)] sm:text-base">
          드라마·영화·노래 차트와 화제 순위를 한곳에서 볼 수 있도록 준비 중입니다.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex text-sm font-medium text-[var(--accent)] hover:underline"
        >
          ← mthemoa.me홈
        </Link>
      </div>
    </main>
  );
}
