import Parser from "rss-parser";

const UA =
  "Mozilla/5.0 (compatible; themoa.me/1.0; +https://themoa.me) AppleWebKit/537.36";

export const RULIWEB_FEED_SOURCES = [
  {
    id: "news_530",
    url: "https://bbs.ruliweb.com/news/530/rss",
    label: "PC/HW 뉴스",
    /** RSS `<channel><link>`와 동일 — `news/board/530` 아님 */
    boardUrl: "https://bbs.ruliweb.com/news/530",
  },
  {
    id: "hotdeal_1020",
    url: "https://bbs.ruliweb.com/community/board/1020/rss",
    label: "커뮤니티 핫딜",
    boardUrl: "https://bbs.ruliweb.com/community/board/1020",
  },
] as const;

export type RuliwebFeedSource = (typeof RULIWEB_FEED_SOURCES)[number];

export type RuliwebFeedItem = {
  title: string;
  link: string;
  pubDate: string | null;
  category: string | null;
};

export type RuliwebFeedResult = {
  source: RuliwebFeedSource;
  items: RuliwebFeedItem[];
  error: string | null;
};

const parser = new Parser({
  timeout: 20000,
  headers: { "User-Agent": UA },
  customFields: {
    item: [["category", "category"]],
  },
});

const MAX_ITEMS = 10;

function pickCategory(item: Parser.Item & { category?: string }): string | null {
  const c = item.category;
  if (typeof c === "string" && c.trim()) return c.trim();
  const first = item.categories?.[0];
  if (typeof first === "string") return first;
  return null;
}

async function fetchOne(source: RuliwebFeedSource): Promise<RuliwebFeedResult> {
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
    const items: RuliwebFeedItem[] = raw.slice(0, MAX_ITEMS).map((it) => {
      const x = it as Parser.Item & { category?: string };
      return {
        title: (x.title ?? "(제목 없음)").replace(/\s+/g, " ").trim(),
        link: (x.link ?? "").trim() || "#",
        pubDate: x.pubDate ?? x.isoDate ?? null,
        category: pickCategory(x),
      };
    });
    return { source, items, error: null };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { source, items: [], error: msg };
  }
}

export async function getRuliwebFeeds(): Promise<RuliwebFeedResult[]> {
  return Promise.all(RULIWEB_FEED_SOURCES.map((s) => fetchOne(s)));
}

export function formatRuliwebDate(isoOrRfc: string | null): string {
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
