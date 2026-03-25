/**
 * 시세 스냅샷 (DB 없음, 서버 fetch + Next 캐시)
 *
 * 환율: @fawazahmed0/currency-api (jsDelivr CDN, API 키 불필요)
 *   https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/krw.min.json
 *   — krw 객체: 1 KRW가 각 통화로 얼마인지. 역수로 1 단위 통화당 원화 계산.
 *
 * 유가·금: Yahoo Finance chart API (비공식, User-Agent 필요할 수 있음)
 *   — WTI 원유 CL=F (USD/배럴), 금 GC=F (COMEX 금 선물, USD/트로이온스)
 *   — Yahoo 측 차단 시 해당 항목만 null.
 */

export type FxCode = "USD" | "EUR" | "JPY" | "CNY";

export type FxRateRow = {
  code: FxCode;
  label: string;
  /** 표시 단위 설명 */
  unit: string;
  /** unit 기준 KRW */
  krw: number;
};

export type OilQuote = {
  symbol: string;
  name: string;
  priceUsd: number;
  currency: string;
};

export type GoldQuote = {
  symbol: string;
  name: string;
  /** USD / 트로이온스 (COMEX 선물) */
  priceUsdPerOz: number;
};

export type MarketSnapshot = {
  fetchedAt: string;
  fx: FxRateRow[] | null;
  oil: OilQuote | null;
  gold: GoldQuote | null;
};

const KRW_JSON =
  "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/krw.min.json";

const FETCH_OPTS = {
  next: { revalidate: 300 },
} as const;

const YAHUA =
  "Mozilla/5.0 (compatible; themoa.me/1.0; +https://themoa.me) AppleWebKit/537.36";

function safeInvert(n: number): number | null {
  if (!Number.isFinite(n) || n === 0) return null;
  return 1 / n;
}

export async function fetchFxRates(): Promise<FxRateRow[] | null> {
  const res = await fetch(KRW_JSON, FETCH_OPTS);
  if (!res.ok) return null;
  const data = (await res.json()) as { krw?: Record<string, number> };
  const k = data.krw;
  if (!k) return null;

  const usd = safeInvert(k.usd);
  const eur = safeInvert(k.eur);
  const jpy = k.jpy ? 100 / k.jpy : null;
  const cny = safeInvert(k.cny);
  if (usd == null || eur == null || jpy == null || cny == null) return null;

  return [
    { code: "USD", label: "달러", unit: "1 USD", krw: usd },
    { code: "EUR", label: "유로", unit: "1 EUR", krw: eur },
    { code: "JPY", label: "엔", unit: "100 JPY", krw: jpy },
    { code: "CNY", label: "위안", unit: "1 CNY", krw: cny },
  ];
}

async function fetchYahooRegularPrice(
  symbol: string,
): Promise<{ price: number; shortName?: string; currency?: string } | null> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`;
  const res = await fetch(url, {
    ...FETCH_OPTS,
    headers: { "User-Agent": YAHUA },
  });
  if (!res.ok) return null;
  const data = (await res.json()) as {
    chart?: { result?: Array<{ meta?: { regularMarketPrice?: number; shortName?: string; currency?: string } }> };
  };
  const meta = data.chart?.result?.[0]?.meta;
  const p = meta?.regularMarketPrice;
  if (typeof p !== "number" || !Number.isFinite(p)) return null;
  return {
    price: p,
    shortName: meta?.shortName,
    currency: meta?.currency,
  };
}

export async function fetchOilQuote(): Promise<OilQuote | null> {
  const q = await fetchYahooRegularPrice("CL=F");
  if (!q) return null;
  return {
    symbol: "CL=F",
    name: q.shortName ?? "WTI 원유 선물",
    priceUsd: q.price,
    currency: q.currency ?? "USD",
  };
}

export async function fetchGoldQuote(): Promise<GoldQuote | null> {
  const q = await fetchYahooRegularPrice("GC=F");
  if (!q) return null;
  return {
    symbol: "GC=F",
    name: q.shortName ?? "COMEX 금 선물",
    priceUsdPerOz: q.price,
  };
}

export async function getMarketSnapshot(): Promise<MarketSnapshot> {
  const fetchedAt = new Date().toISOString();

  const [fx, oil, gold] = await Promise.all([
    fetchFxRates().catch(() => null),
    fetchOilQuote().catch(() => null),
    fetchGoldQuote().catch(() => null),
  ]);

  return { fetchedAt, fx, oil, gold };
}

export function formatKrw(n: number): string {
  return new Intl.NumberFormat("ko-KR", {
    maximumFractionDigits: n >= 100 ? 1 : 2,
    minimumFractionDigits: 0,
  }).format(n);
}

export function formatUsd(n: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}
