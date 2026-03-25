import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "주식",
  description: "시장·종목 인사이트 — moa.mthemoa.me너(준비 중).",
};

export default function StocksPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm sm:p-8">
        <p className="text-sm font-medium text-[var(--accent)]">주식</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-[var(--text)] sm:text-3xl">
          주식 코너
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-[var(--text-muted)] sm:text-base">
          시장 흐름, 종목 이슈, 투자 아이디어를 모을 예정입니다. 콘텐츠는 순차적으로
          연결됩니다.
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
