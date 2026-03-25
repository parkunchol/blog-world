import { getMarketSnapshot, formatKrw, formatUsd } from "@/lib/market-data";

function Muted({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs text-[var(--text-muted)]">{children}</span>
  );
}

export async function HomeMarketSnapshot() {
  const snap = await getMarketSnapshot();

  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-2 border-b border-[var(--border)] pb-3">
        <div>
          <h2 className="text-lg font-semibold text-[var(--text)]">오늘의 시세</h2>
          <p className="mt-0.5 text-xs text-[var(--text-muted)]">
            환율·유가·금 — 캐시 약 5분. 표시는 참고용입니다.
          </p>
        </div>
        <Muted>
          {new Date(snap.fetchedAt).toLocaleString("ko-KR", {
            timeZone: "Asia/Seoul",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Muted>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)]/40 p-4">
          <h3 className="text-sm font-medium text-[var(--text)]">환율 (원화 기준)</h3>
          {snap.fx?.length ? (
            <ul className="mt-3 space-y-2 text-sm">
              {snap.fx.map((row) => (
                <li
                  key={row.code}
                  className="flex items-baseline justify-between gap-2 border-b border-[var(--border)]/60 pb-2 last:border-b-0 last:pb-0"
                >
                  <span className="text-[var(--text-muted)]">
                    {row.label}
                    <span className="ml-1 text-[11px] opacity-80">
                      ({row.unit})
                    </span>
                  </span>
                  <span className="font-medium tabular-nums text-[var(--text)]">
                    {formatKrw(row.krw)}원
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-[var(--text-muted)]">불러오지 못함</p>
          )}
        </div>

        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)]/40 p-4">
          <h3 className="text-sm font-medium text-[var(--text)]">국제 유가</h3>
          {snap.oil ? (
            <div className="mt-3 space-y-1">
              <p className="text-lg font-semibold tabular-nums text-[var(--text)]">
                {formatUsd(snap.oil.priceUsd)}
                <span className="ml-1 text-sm font-normal text-[var(--text-muted)]">
                  USD/배럴
                </span>
              </p>
              <Muted>{snap.oil.name}</Muted>
              <Muted>WTI · {snap.oil.symbol}</Muted>
            </div>
          ) : (
            <p className="mt-3 text-sm text-[var(--text-muted)]">불러오지 못함</p>
          )}
        </div>

        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)]/40 p-4">
          <h3 className="text-sm font-medium text-[var(--text)]">국제 금</h3>
          {snap.gold ? (
            <div className="mt-3 space-y-1">
              <p className="text-lg font-semibold tabular-nums text-[var(--text)]">
                {formatUsd(snap.gold.priceUsdPerOz)}
                <span className="ml-1 text-sm font-normal text-[var(--text-muted)]">
                  USD/트로이온스
                </span>
              </p>
              <Muted>{snap.gold.name}</Muted>
              <Muted>{snap.gold.symbol} · 선물 시세</Muted>
            </div>
          ) : (
            <p className="mt-3 text-sm text-[var(--text-muted)]">불러오지 못함</p>
          )}
        </div>
      </div>

      <p className="mt-4 text-[11px] leading-relaxed text-[var(--text-muted)]">
        환율: currency-api (jsDelivr). 유가·금: Yahoo Finance 비공식 API — 장애·차단 시 일부만 표시될 수
        있습니다. 투자 판단용이 아닙니다.
      </p>
    </section>
  );
}
