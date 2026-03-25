/**
 * 서버 전용 — YOUTUBE_API_KEY 는 클라이언트에 노출하지 마세요.
 */

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

export async function searchCreativeCommonVideos(
  query: string,
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
