import Link from "next/link";
import type { StockTimelineItem } from "@/lib/stock-feed";
import { RSS_FEED_OPTIONS } from "@/lib/stock-feed";

function feedLabel(feedId: string): string {
  return RSS_FEED_OPTIONS.find((o) => o.value === feedId)?.label ?? feedId;
}

function formatSortTime(sortAt: number) {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(sortAt));
}

export function StocksTimeline({
  visible,
  hasMore,
  moreHref,
  totalMerged,
}: {
  visible: StockTimelineItem[];
  hasMore: boolean;
  moreHref: string | null;
  totalMerged: number;
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-[var(--text)]">최근 타임라인</h2>
      {totalMerged === 0 ? (
        <p className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--surface-muted)]/50 px-4 py-8 text-center text-sm text-[var(--text-muted)]">
          조건에 맞는 공시·뉴스가 없습니다.
        </p>
      ) : (
        <>
          <ul className="divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] bg-[var(--surface)]">
            {visible.map((item) => {
              if (item.kind === "filing") {
                const f = item.filing;
                return (
                  <li key={`f-${f.id}`} className="px-4 py-3 sm:px-5">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded bg-[var(--surface-muted)] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--accent)]">
                            공시
                          </span>
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
                        </div>
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
                        {formatSortTime(item.sortAt)}
                      </time>
                    </div>
                  </li>
                );
              }
              const n = item.news;
              return (
                <li key={`n-${n.id}`} className="px-4 py-3 sm:px-5">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded bg-[var(--surface-muted)] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                          뉴스
                        </span>
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
                      </div>
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
                      {formatSortTime(item.sortAt)}
                    </time>
                  </div>
                </li>
              );
            })}
          </ul>
          <p className="text-center text-xs text-[var(--text-muted)]">
            {visible.length} / {totalMerged}건 표시
          </p>
          {hasMore && moreHref ? (
            <div className="flex justify-center">
              <Link
                href={moreHref}
                className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-6 py-2.5 text-sm font-medium text-[var(--text)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
              >
                더보기
              </Link>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
