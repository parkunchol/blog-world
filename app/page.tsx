import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "홈",
  description:
    "themoa.me — 주식, 테크, 드라마·영화·노래 순위 등 큐레이션 허브.",
};

const sections = [
  {
    href: "/stocks",
    label: "주식",
    description: "시장과 종목 이슈, 투자에 참고할 만한 요약을 모읍니다.",
  },
  {
    href: "/tech",
    label: "테크",
    description: "Tech Crunch Blog — 테크 기사 한글화와 최신 글.",
    badge: "Tech Crunch Blog",
  },
  {
    href: "/rankings",
    label: "순위정보",
    description: "드라마·영화·음원 등 차트와 화제 순위를 다룹니다.",
  },
] as const;

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-10">
      <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm sm:p-8">
        <p className="text-sm font-medium text-[var(--accent)]">themoa.me</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-[var(--text)] sm:text-3xl">
          주식, 테크, 순위를 한곳에서
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-[var(--text-muted)] sm:text-base">
          주식 인사이트, 테크 뉴스(Tech Crunch Blog), 드라마·영화·노래 순위 같은
          화제 정보까지 섹션별로 모아 갑니다. 아래에서 들어갈 코너를 고르세요.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-[var(--text)]">코너</h2>
        <ul className="flex flex-col gap-3">
          {sections.map((s) => (
            <li key={s.href}>
              <Link
                href={s.href}
                className="group block rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm transition-colors hover:border-[var(--accent)]/40 hover:bg-[var(--surface-muted)]/50"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="text-lg font-semibold text-[var(--text)] group-hover:text-[var(--accent)]">
                    {s.label}
                  </span>
                  {"badge" in s && s.badge ? (
                    <span className="rounded-full bg-[var(--surface-muted)] px-2.5 py-0.5 text-xs font-medium text-[var(--text-muted)]">
                      {s.badge}
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
                  {s.description}
                </p>
                <span className="mt-3 inline-flex text-sm font-medium text-[var(--accent)]">
                  들어가기 →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
