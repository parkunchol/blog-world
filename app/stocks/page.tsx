import type { Metadata } from "next";
import Link from "next/link";
import { StocksSearchForm } from "@/components/stocks/StocksSearchForm";
import { StocksTimeline } from "@/components/stocks/StocksTimeline";
import {
  buildStocksQueryString,
  fetchStockTimeline,
  mergeStockTimeline,
  parseDisplayLimit,
  STOCK_DISPLAY_STEP,
  stockFiltersFromSearchParams,
} from "@/lib/stock-feed";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "주식",
  description:
    "최근 공시·뉴스 타임라인. 종목·기간·키워드로 검색합니다. — themoa.me",
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function StocksPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const filters = stockFiltersFromSearchParams(sp);
  const displayLimit = parseDisplayLimit(sp);
  let filings: Awaited<
    ReturnType<typeof fetchStockTimeline>
  >["filings"] = [];
  let news: Awaited<ReturnType<typeof fetchStockTimeline>>["news"] = [];
  let loadError: string | null = null;

  try {
    const data = await fetchStockTimeline(filters);
    filings = data.filings;
    news = data.news;
  } catch (e) {
    console.error(e);
    loadError =
      e instanceof Error ? e.message : "데이터를 불러오지 못했습니다.";
  }

  const merged = mergeStockTimeline(filings, news);
  const visible = merged.slice(0, displayLimit);
  const hasMore = merged.length > visible.length;
  const moreHref =
    hasMore && !loadError
      ? `/stocks${buildStocksQueryString(filters, displayLimit + STOCK_DISPLAY_STEP)}`
      : null;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 pb-12">
      <div>
        <p className="text-sm font-medium text-[var(--accent)]">주식</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-[var(--text)] sm:text-3xl">
          공시 · 뉴스
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-[var(--text-muted)] sm:text-base">
          금융감독원 공시와 수집 중인 경제 뉴스를 날짜순으로 모아 둡니다. 아래에서
          검색·필터를 조정할 수 있습니다.
        </p>
      </div>

      <StocksSearchForm filters={filters} />

      {loadError ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
          {loadError}
        </p>
      ) : (
        <StocksTimeline
          visible={visible}
          hasMore={hasMore}
          moreHref={moreHref}
          totalMerged={merged.length}
        />
      )}

      <Link
        href="/"
        className="text-sm font-medium text-[var(--accent)] hover:underline"
      >
        ← 홈
      </Link>
    </main>
  );
}
