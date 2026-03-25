import { createPublicSupabaseClient } from "@/lib/supabase/public";

/** ingest 스크립트와 맞춘 공시 키워드 프리셋(UI 필터용) */
export const DART_KEYWORD_PRESETS: { value: string; label: string }[] = [
  { value: "", label: "키워드 전체" },
  { value: "IR", label: "IR" },
  { value: "기업설명서", label: "기업설명서" },
  { value: "투자설명서", label: "투자설명서" },
  { value: "유상증자", label: "유상증자" },
  { value: "유증", label: "유증" },
  { value: "신주인수권", label: "신주인수권" },
  { value: "수주", label: "수주" },
  { value: "단일판매", label: "단일판매" },
  { value: "공급계약", label: "공급계약" },
];

export const RSS_FEED_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "전체 매체" },
  { value: "yna_market", label: "연합뉴스 마켓" },
  { value: "yna_economy", label: "연합뉴스 경제" },
  { value: "infomax_sec", label: "인포맥스 증권" },
];

export type StockFeedType = "all" | "news" | "filings";

export type StockFeedFilters = {
  q: string;
  code: string;
  from: string;
  to: string;
  type: StockFeedType;
  dartKw: string;
  feedId: string;
};

export type RssItemRow = {
  id: string;
  feed_id: string;
  url: string;
  title: string;
  published_at: string;
  stock_codes: string[];
};

export type DartFilingRow = {
  id: string;
  rcept_no: string;
  rcept_dt: string;
  corp_name: string | null;
  report_nm: string;
  stock_code: string | null;
  url: string;
};

const LIMIT = 200;

function clip(s: string, n: number): string {
  return s.trim().slice(0, n);
}

/** KST 달력 기준 오늘 포함 최근 n일 [from, to] YYYY-MM-DD */
export function defaultDateRangeKst(days: number): { from: string; to: string } {
  const to = new Date();
  const from = new Date(to);
  from.setDate(from.getDate() - (days - 1));
  const fmt = (d: Date) => {
    const s = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Seoul",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(d);
    return s;
  };
  return { from: fmt(from), to: fmt(to) };
}

function dayEndKstIso(dateYmd: string): string {
  return `${dateYmd}T23:59:59.999+09:00`;
}

function dayStartKstIso(dateYmd: string): string {
  return `${dateYmd}T00:00:00.000+09:00`;
}

function parseFilters(sp: Record<string, string | undefined>): StockFeedFilters {
  const def = defaultDateRangeKst(7);
  const typeRaw = sp.type ?? "all";
  const type: StockFeedType =
    typeRaw === "news" || typeRaw === "filings" ? typeRaw : "all";

  return {
    q: clip(sp.q ?? "", 120),
    code: clip(sp.code ?? "", 6).replace(/\D/g, "").slice(0, 6),
    from: (sp.from ?? def.from).slice(0, 10),
    to: (sp.to ?? def.to).slice(0, 10),
    type,
    dartKw: clip(sp.dart_kw ?? "", 80),
    feedId: clip(sp.feed ?? "", 32),
  };
}

export function stockFiltersFromSearchParams(
  sp: Record<string, string | string[] | undefined>,
): StockFeedFilters {
  const flat: Record<string, string | undefined> = {};
  for (const [k, v] of Object.entries(sp)) {
    flat[k] = Array.isArray(v) ? v[0] : v;
  }
  return parseFilters(flat);
}

export async function fetchStockTimeline(
  filters: StockFeedFilters,
): Promise<{ filings: DartFilingRow[]; news: RssItemRow[] }> {
  const supabase = createPublicSupabaseClient();
  if (!supabase) return { filings: [], news: [] };

  const { q, code, from, to, type, dartKw, feedId } = filters;
  const wantFilings = type === "all" || type === "filings";
  const wantNews = type === "all" || type === "news";

  const filings: DartFilingRow[] = [];
  const news: RssItemRow[] = [];

  if (wantFilings) {
    let dq = supabase
      .from("dart_filings")
      .select(
        "id,rcept_no,rcept_dt,corp_name,report_nm,stock_code,url",
      )
      .order("rcept_dt", { ascending: false })
      .limit(LIMIT);

    dq = dq.gte("rcept_dt", from).lte("rcept_dt", to);

    if (code) dq = dq.eq("stock_code", code);
    if (dartKw) dq = dq.ilike("report_nm", `%${dartKw}%`);
    if (q) {
      const safe = q.replace(/%/g, "").replace(/,/g, "");
      const p = `%${safe}%`;
      dq = dq.or(`report_nm.ilike.${p},corp_name.ilike.${p}`);
    }

    const { data, error } = await dq;
    if (error) throw error;
    for (const row of data ?? []) {
      filings.push(row as DartFilingRow);
    }
  }

  if (wantNews) {
    let nq = supabase
      .from("rss_items")
      .select("id,feed_id,url,title,published_at,stock_codes")
      .order("published_at", { ascending: false })
      .limit(LIMIT);

    nq = nq
      .gte("published_at", dayStartKstIso(from))
      .lte("published_at", dayEndKstIso(to));

    if (code) nq = nq.contains("stock_codes", [code]);
    if (feedId) nq = nq.eq("feed_id", feedId);
    if (q) nq = nq.ilike("title", `%${q.replace(/%/g, "").replace(/,/g, "")}%`);

    const { data, error } = await nq;
    if (error) throw error;
    for (const row of data ?? []) {
      news.push(row as RssItemRow);
    }
  }

  return { filings, news };
}
