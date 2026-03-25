import Parser from "rss-parser";

const UA =
  "Mozilla/5.0 (compatible; themoa.me/1.0; +https://themoa.me) AppleWebKit/537.36";

/**
 * RSS `rss.php?id=` 와 동일한 id의 게시판 URL은
 * `zboard.php?id=` (RSS `<channel><link>`와 일치)
 */
export const PPOMPPU_FEED_SOURCES = [
  {
    id: "ppomppu",
    url: "https://www.ppomppu.co.kr/rss.php?id=ppomppu",
    label: "핫딜(뽐뿌)",
    boardUrl: "https://www.ppomppu.co.kr/zboard/zboard.php?id=ppomppu",
  },
  {
    id: "pmarket",
    url: "https://www.ppomppu.co.kr/rss.php?id=pmarket",
    label: "쇼핑뽐뿌",
    boardUrl: "https://www.ppomppu.co.kr/zboard/zboard.php?id=pmarket",
  },
] as const;

export type PpomppuFeedSource = (typeof PPOMPPU_FEED_SOURCES)[number];

export type PpomppuFeedItem = {
  title: string;
  link: string;
  pubDate: string | null;
};

export type PpomppuFeedResult = {
  source: PpomppuFeedSource;
  items: PpomppuFeedItem[];
  error: string | null;
};

const parser = new Parser({
  timeout: 20000,
  headers: { "User-Agent": UA },
});

const MAX_ITEMS = 10;

async function fetchOne(source: PpomppuFeedSource): Promise<PpomppuFeedResult> {
  try {
    const res = await fetch(source.url, {
      next: { revalidate: 300 },
      headers: { "User-Agent": UA },
    });
    if (!res.ok) {
      return { source, items: [], error: `HTTP ${res.status}` };
    }
    const xml = await res.text();
    const feed = await parser.parseString(xml);
    const raw = feed.items ?? [];
    const items: PpomppuFeedItem[] = raw.slice(0, MAX_ITEMS).map((it) => ({
      title: (it.title ?? "(제목 없음)").replace(/\s+/g, " ").trim(),
      link: (it.link ?? "").trim() || "#",
      pubDate: it.pubDate ?? it.isoDate ?? null,
    }));
    return { source, items, error: null };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { source, items: [], error: msg };
  }
}

export async function getPpomppuFeeds(): Promise<PpomppuFeedResult[]> {
  return Promise.all(PPOMPPU_FEED_SOURCES.map((s) => fetchOne(s)));
}

export function formatPpomppuDate(isoOrRfc: string | null): string {
  if (!isoOrRfc) return "";
  const d = new Date(isoOrRfc);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}
