import {
  DART_KEYWORD_PRESETS,
  RSS_FEED_OPTIONS,
  type StockFeedFilters,
} from "@/lib/stock-feed";

export function StocksSearchForm({ filters }: { filters: StockFeedFilters }) {
  const { q, code, from, to, type, dartKw, feedId } = filters;

  return (
    <form
      method="get"
      action="/stocks"
      className="flex flex-col gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm sm:p-5"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-3">
        <label className="min-w-0 flex-1">
          <span className="mb-1 block text-xs font-medium text-[var(--text-muted)]">
            검색어
          </span>
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="뉴스 제목 · 공시명 · 회사명"
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none"
            autoComplete="off"
          />
        </label>
        <label className="sm:w-28">
          <span className="mb-1 block text-xs font-medium text-[var(--text-muted)]">
            종목코드
          </span>
          <input
            type="text"
            name="code"
            defaultValue={code}
            inputMode="numeric"
            maxLength={6}
            placeholder="6자리"
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none"
            autoComplete="off"
          />
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label>
          <span className="mb-1 block text-xs font-medium text-[var(--text-muted)]">
            시작일
          </span>
          <input
            type="date"
            name="from"
            defaultValue={from}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-sm text-[var(--text)] focus:border-[var(--accent)] focus:outline-none"
          />
        </label>
        <label>
          <span className="mb-1 block text-xs font-medium text-[var(--text-muted)]">
            종료일
          </span>
          <input
            type="date"
            name="to"
            defaultValue={to}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-sm text-[var(--text)] focus:border-[var(--accent)] focus:outline-none"
          />
        </label>
        <label>
          <span className="mb-1 block text-xs font-medium text-[var(--text-muted)]">
            유형
          </span>
          <select
            name="type"
            defaultValue={type}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-sm text-[var(--text)] focus:border-[var(--accent)] focus:outline-none"
          >
            <option value="all">전체</option>
            <option value="filings">공시만</option>
            <option value="news">뉴스만</option>
          </select>
        </label>
        <label>
          <span className="mb-1 block text-xs font-medium text-[var(--text-muted)]">
            공시 키워드
          </span>
          <select
            name="dart_kw"
            defaultValue={dartKw}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-sm text-[var(--text)] focus:border-[var(--accent)] focus:outline-none"
          >
            {DART_KEYWORD_PRESETS.map((o) => (
              <option key={o.value || "all"} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <label className="sm:max-w-xs">
          <span className="mb-1 block text-xs font-medium text-[var(--text-muted)]">
            뉴스 매체
          </span>
          <select
            name="feed"
            defaultValue={feedId}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-sm text-[var(--text)] focus:border-[var(--accent)] focus:outline-none"
          >
            {RSS_FEED_OPTIONS.map((o) => (
              <option key={o.value || "all"} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            검색
          </button>
          <a
            href="/stocks"
            className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            초기화
          </a>
        </div>
      </div>
    </form>
  );
}
