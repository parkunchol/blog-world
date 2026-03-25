import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { YoutubeSearchItem } from "@/lib/youtube-search";
import {
  parseYoutubeSearchParams,
  searchCreativeCommonVideos,
} from "@/lib/youtube-search";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "YouTube 검색",
  description:
    "CC 라이선스 · 20분 초과 롱폼 동영상 검색 (YouTube Data API v3) — themoa.me",
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function VideoCard({ item }: { item: YoutubeSearchItem }) {
  const id = item.id?.videoId;
  const sn = item.snippet;
  const thumb =
    sn?.thumbnails?.medium?.url ??
    sn?.thumbnails?.default?.url ??
    sn?.thumbnails?.high?.url;
  const title = sn?.title ?? "(제목 없음)";
  const channel = sn?.channelTitle ?? "";
  const href = id ? `https://www.youtube.com/watch?v=${encodeURIComponent(id)}` : "#";

  return (
    <li className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm transition-shadow hover:shadow-md">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        <div className="relative aspect-video w-full bg-[var(--surface-muted)]">
          {thumb ? (
            <Image
              src={thumb}
              alt=""
              fill
              sizes="(max-width: 640px) 100vw, 50vw"
              className="object-cover"
              unoptimized={!thumb.startsWith("https://i.ytimg.com")}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-[var(--text-muted)]">
              썸네일 없음
            </div>
          )}
        </div>
        <div className="space-y-1 p-3">
          <p className="line-clamp-2 text-sm font-medium leading-snug text-[var(--text)]">
            {title}
          </p>
          {channel ? (
            <p className="truncate text-xs text-[var(--text-muted)]">{channel}</p>
          ) : null}
        </div>
      </a>
    </li>
  );
}

export default async function YoutubeSearchPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const { q, from, to } = parseYoutubeSearchParams(sp);

  let items: YoutubeSearchItem[] = [];
  let error: string | null = null;

  if (q) {
    const result = await searchCreativeCommonVideos(q, {
      publishedAfterYmd: from || undefined,
      publishedBeforeYmd: to || undefined,
    });
    if (!result.ok) {
      error = result.error;
    } else {
      items = result.data.items ?? [];
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 pb-12">
      <div>
        <p className="text-sm font-medium text-[var(--accent)]">YouTube</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-[var(--text)] sm:text-3xl">
          CC 동영상 검색
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-[var(--text-muted)] sm:text-base">
          <code className="rounded bg-[var(--surface-muted)] px-1 text-xs">
            videoLicense=creativeCommon
          </code>
          ,{" "}
          <code className="rounded bg-[var(--surface-muted)] px-1 text-xs">
            videoDuration=long
          </code>
          (20분 초과)인 동영상만 검색합니다. 아래 기간은{" "}
          <strong className="text-[var(--text)]">업로드일</strong>(공개 시점) 기준이며, 날짜를
          비우면 <strong className="text-[var(--text)]">당일 포함 최근 2주(KST)</strong>가
          기본입니다.
        </p>
      </div>

      <form
        method="get"
        action="/youtube"
        className="flex flex-col gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm sm:p-5"
      >
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-[var(--text-muted)]">
            검색어
          </span>
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="검색어를 입력하세요"
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2.5 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none"
            autoComplete="off"
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label>
            <span className="mb-1 block text-xs font-medium text-[var(--text-muted)]">
              업로드 시작일 (선택)
            </span>
            <input
              type="date"
              name="from"
              defaultValue={from}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2.5 text-sm text-[var(--text)] focus:border-[var(--accent)] focus:outline-none"
            />
          </label>
          <label>
            <span className="mb-1 block text-xs font-medium text-[var(--text-muted)]">
              업로드 종료일 (선택)
            </span>
            <input
              type="date"
              name="to"
              defaultValue={to}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2.5 text-sm text-[var(--text)] focus:border-[var(--accent)] focus:outline-none"
            />
          </label>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            className="rounded-lg bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-white hover:opacity-90"
          >
            검색
          </button>
          <Link
            href="/youtube"
            className="rounded-lg border border-[var(--border)] px-5 py-2.5 text-sm font-medium text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            초기화
          </Link>
        </div>
      </form>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </p>
      ) : null}

      {!q ? (
        <p className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--surface-muted)]/50 px-4 py-10 text-center text-sm text-[var(--text-muted)]">
          검색어를 입력한 뒤 검색해 보세요.
        </p>
      ) : !error && items.length === 0 ? (
        <p className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--surface-muted)]/50 px-4 py-10 text-center text-sm text-[var(--text-muted)]">
          결과가 없습니다. 다른 검색어를 시도해 보세요.
        </p>
      ) : !error ? (
        <ul className="grid gap-4 sm:grid-cols-2">
          {items.map((item, i) => {
            const key = item.id?.videoId ?? `row-${i}`;
            return <VideoCard key={key} item={item} />;
          })}
        </ul>
      ) : null}

      <Link
        href="/"
        className="text-sm font-medium text-[var(--accent)] hover:underline"
      >
        ← 홈
      </Link>
    </main>
  );
}
