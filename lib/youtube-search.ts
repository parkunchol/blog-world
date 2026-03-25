/**
 * 서버 전용 — YOUTUBE_API_KEY 는 클라이언트에 노출하지 마세요.
 */

import { defaultDateRangeKst } from "@/lib/stock-feed";

/** 기간 미지정 시: KST 기준 오늘 포함 최근 14일(2주) */
const DEFAULT_RANGE_DAYS = 14;

export type YoutubeSearchItem = {
  id: { kind?: string; videoId?: string };
  snippet?: {
    title?: string;
    description?: string;
    channelTitle?: string;
    publishedAt?: string;
    thumbnails?: {
      default?: { url?: string };
      medium?: { url?: string };
      high?: { url?: string };
    };
  };
};

export type YoutubeSearchResponse = {
  items?: YoutubeSearchItem[];
  error?: { message?: string; code?: number };
  pageInfo?: { totalResults?: number };
};

const API = "https://www.googleapis.com/youtube/v3/search";

export type YoutubeSearchOptions = {
  /** YYYY-MM-DD — 업로드 시각이 이 날짜 00:00 UTC 이후 */
  publishedAfterYmd?: string;
  /** YYYY-MM-DD — 업로드 시각이 이 날짜 23:59:59.999 UTC 이전 */
  publishedBeforeYmd?: string;
};

function ymdToPublishedAfter(ymd: string): string {
  return `${ymd}T00:00:00.000Z`;
}

function ymdToPublishedBefore(ymd: string): string {
  return `${ymd}T23:59:59.999Z`;
}

export async function searchCreativeCommonVideos(
  query: string,
  options?: YoutubeSearchOptions,
): Promise<{ ok: true; data: YoutubeSearchResponse } | { ok: false; error: string }> {
  const key = process.env.YOUTUBE_API_KEY?.trim();
  if (!key) {
    return { ok: false, error: "YOUTUBE_API_KEY 가 설정되지 않았습니다." };
  }

  const q = query.trim();
  if (!q) {
    return { ok: true, data: { items: [] } };
  }

  const url = new URL(API);
  url.searchParams.set("part", "snippet");
  url.searchParams.set("q", q);
  url.searchParams.set("type", "video");
  url.searchParams.set("videoLicense", "creativeCommon");
  /** 20분 초과 롱폼만 (API: videoDuration=long) */
  url.searchParams.set("videoDuration", "long");

  const after = options?.publishedAfterYmd?.trim();
  const before = options?.publishedBeforeYmd?.trim();
  if (after && /^\d{4}-\d{2}-\d{2}$/.test(after)) {
    url.searchParams.set("publishedAfter", ymdToPublishedAfter(after));
  }
  if (before && /^\d{4}-\d{2}-\d{2}$/.test(before)) {
    url.searchParams.set("publishedBefore", ymdToPublishedBefore(before));
  }

  url.searchParams.set("key", key);
  url.searchParams.set("maxResults", "25");

  const res = await fetch(url.toString(), {
    next: { revalidate: 0 },
  });

  const data = (await res.json()) as YoutubeSearchResponse;

  if (!res.ok) {
    const msg =
      data.error?.message ?? `HTTP ${res.status}`;
    return { ok: false, error: msg };
  }

  if (data.error?.message) {
    return { ok: false, error: data.error.message };
  }

  return { ok: true, data };
}

export function parseYoutubeQuery(
  sp: Record<string, string | string[] | undefined>,
): string {
  const raw = Array.isArray(sp.q) ? sp.q[0] : sp.q;
  return (raw ?? "").trim().slice(0, 200);
}

/** 검색어 + 업로드 기간(YYYY-MM-DD). 시작이 끝보다 늦으면 서로 바꿉니다. */
export function parseYoutubeSearchParams(sp: Record<string, string | string[] | undefined>): {
  q: string;
  from: string;
  to: string;
} {
  const q = parseYoutubeQuery(sp);
  const fromRaw = Array.isArray(sp.from) ? sp.from[0] : sp.from;
  const toRaw = Array.isArray(sp.to) ? sp.to[0] : sp.to;
  let from = (fromRaw ?? "").trim().slice(0, 10);
  let to = (toRaw ?? "").trim().slice(0, 10);
  if (from && !/^\d{4}-\d{2}-\d{2}$/.test(from)) from = "";
  if (to && !/^\d{4}-\d{2}-\d{2}$/.test(to)) to = "";
  if (from && to && from > to) {
    const t = from;
    from = to;
    to = t;
  }
  if (!from && !to) {
    const def = defaultDateRangeKst(DEFAULT_RANGE_DAYS);
    from = def.from;
    to = def.to;
  }
  return { q, from, to };
}
