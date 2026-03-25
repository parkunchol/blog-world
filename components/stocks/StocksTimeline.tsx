import type { DartFilingRow, RssItemRow } from "@/lib/stock-feed";
import { RSS_FEED_OPTIONS } from "@/lib/stock-feed";

function feedLabel(feedId: string): string {
  return RSS_FEED_OPTIONS.find((o) => o.value === feedId)?.label ?? feedId;
}

function formatNewsTime(iso: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

function formatRceptDt(d: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    dateStyle: "medium",
  }).format(new Date(d + "T12:00:00+09:00"));
}

export function StocksTimeline({
  filings,
  news,
}: {
  filings: DartFilingRow[];
  news: RssItemRow[];
}) {
  return (
    <div className="flex flex-col gap-10">
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-[var(--text)]">공시</h2>
        {filings.length === 0 ? (
          <p className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--surface-muted)]/50 px-4 py-8 text-center text-sm text-[var(--text-muted)]">
            조건에 맞는 공시가 없습니다.
          </p>
        ) : (
          <ul className="divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] bg-[var(--surface)]">
            {filings.map((f) => (
              <li key={f.id} className="px-4 py-3 sm:px-5">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="text-sm font-medium leading-snug text-[var(--text)]">
                      <a
                        href={f.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-[var(--accent)] hover:underline"
                      >
                        {f.report_nm}
                      </a>
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {f.corp_name ?? "—"}
                      {f.stock_code ? (
                        <span className="ml-2 font-mono text-[var(--text)]">
                          {f.stock_code}
                        </span>
                      ) : null}
                    </p>
                  </div>
                  <time
                    className="shrink-0 text-xs text-[var(--text-muted)]"
                    dateTime={f.rcept_dt}
                  >
                    {formatRceptDt(f.rcept_dt)}
                  </time>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-[var(--text)]">뉴스</h2>
        {news.length === 0 ? (
          <p className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--surface-muted)]/50 px-4 py-8 text-center text-sm text-[var(--text-muted)]">
            조건에 맞는 뉴스가 없습니다.
          </p>
        ) : (
          <ul className="divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] bg-[var(--surface)]">
            {news.map((n) => (
              <li key={n.id} className="px-4 py-3 sm:px-5">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="text-sm font-medium leading-snug text-[var(--text)]">
                      <a
                        href={n.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-[var(--accent)] hover:underline"
                      >
                        {n.title}
                      </a>
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {feedLabel(n.feed_id)}
                      {n.stock_codes?.length ? (
                        <span className="ml-2 font-mono text-[var(--text)]">
                          {n.stock_codes.join(", ")}
                        </span>
                      ) : null}
                    </p>
                  </div>
                  <time
                    className="shrink-0 text-xs text-[var(--text-muted)]"
                    dateTime={n.published_at}
                  >
                    {formatNewsTime(n.published_at)}
                  </time>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
