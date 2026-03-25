import { getDailyFortune } from "@/lib/daily-fortune";

export async function HomeDailyFortune() {
  const f = await getDailyFortune();
  const ddi = f.ddi ?? [];
  const signs = f.signs ?? [];

  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--border)] pb-3">
        <div>
          <h2 className="text-lg font-semibold text-[var(--text)]">오늘의 운세</h2>
          <p className="mt-0.5 text-xs text-[var(--text-muted)]">
            KST 기준 · 날짜마다 바뀌는 참고용입니다. 띠·별자리는 요약 한 줄과
            상세 문단이 함께 표시됩니다.
          </p>
        </div>
        <time
          dateTime={f.dateKst}
          className="text-xs font-medium text-[var(--accent)]"
        >
          {f.dateKst.replace(/\//g, "-")}
        </time>
      </div>

      <div className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--surface-muted)]/50 p-4">
        <p className="text-sm font-medium text-[var(--text)] leading-relaxed">
          {f.general}
        </p>
        <p className="mt-3 text-xs text-[var(--text-muted)]">
          행운 키워드:{" "}
          <span className="font-semibold text-[var(--accent)]">{f.keyword}</span>
        </p>
      </div>

      <details className="mt-4 group">
        <summary className="cursor-pointer list-none text-sm font-medium text-[var(--text)] [&::-webkit-details-marker]:hidden">
          <span className="text-[var(--accent)] group-open:opacity-80">
            12띠 운세 보기
          </span>
          <span className="ml-1 text-xs font-normal text-[var(--text-muted)]">
            (탭하여 펼치기)
          </span>
        </summary>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2">
          {ddi.map((d) => (
            <li
              key={d.name}
              className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-3 text-sm"
            >
              <span className="font-semibold text-[var(--text)]">{d.label}</span>
              <p className="mt-1.5 text-[13px] font-medium leading-snug text-[var(--text)]">
                {d.line}
              </p>
              <p className="mt-2 text-[13px] leading-relaxed text-[var(--text-muted)]">
                {d.detail}
              </p>
            </li>
          ))}
        </ul>
      </details>

      <details className="mt-3 group">
        <summary className="cursor-pointer list-none text-sm font-medium text-[var(--text)] [&::-webkit-details-marker]:hidden">
          <span className="text-[var(--accent)] group-open:opacity-80">
            12별자리 운세 보기
          </span>
          <span className="ml-1 text-xs font-normal text-[var(--text-muted)]">
            (탭하여 펼치기)
          </span>
        </summary>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2">
          {signs.map((s) => (
            <li
              key={s.name}
              className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-3 text-sm"
            >
              <span className="font-semibold text-[var(--text)]">{s.name}</span>
              <p className="mt-1.5 text-[13px] font-medium leading-snug text-[var(--text)]">
                {s.line}
              </p>
              <p className="mt-2 text-[13px] leading-relaxed text-[var(--text-muted)]">
                {s.detail}
              </p>
            </li>
          ))}
        </ul>
      </details>

      <p className="mt-4 text-[11px] leading-relaxed text-[var(--text-muted)]">
        이 내용은 서비스 내에서 날짜를 기준으로 골라 보여 주는{" "}
        <strong className="font-medium text-[var(--text)]">참고·엔터테인먼트</strong>
        용입니다. 과학적·의학적·재무적 조언이 아니며, 중요한 결정은 전문가와
        상담하세요. (API/RSS 없이 일간 생성 — 필요 시 나중에 외부 소스로 교체
        가능합니다.)
      </p>
    </section>
  );
}
