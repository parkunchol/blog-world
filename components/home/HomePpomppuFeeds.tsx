import Link from "next/link";
import {
  formatPpomppuDate,
  getPpomppuFeeds,
} from "@/lib/ppomppu-feeds";

export async function HomePpomppuFeeds() {
  const feeds = await getPpomppuFeeds();

  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm sm:p-6">
      <div className="border-b border-[var(--border)] pb-3">
        <h2 className="text-lg font-semibold text-[var(--text)]">뽐뿌</h2>
        <p className="mt-0.5 text-xs text-[var(--text-muted)]">
          RSS만 사용 · 약 5분 캐시 · 게시판 링크는 RSS 채널과 동일한
          `zboard.php?id=…` 주소입니다.
        </p>
      </div>

      <div className="mt-4 grid gap-6 md:grid-cols-2">
        {feeds.map((block) => (
          <div key={block.source.id} className="min-w-0">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-sm font-semibold text-[var(--text)]">
                {block.source.label}
              </h3>
              <Link
                href={block.source.boardUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium text-[var(--accent)] hover:underline"
              >
                게시판 →
              </Link>
            </div>

            {block.error ? (
              <p className="mt-2 text-sm text-[var(--text-muted)]">
                불러오지 못했습니다. ({block.error})
              </p>
            ) : block.items.length === 0 ? (
              <p className="mt-2 text-sm text-[var(--text-muted)]">
                글이 없습니다.
              </p>
            ) : (
              <ul className="mt-3 space-y-2.5">
                {block.items.map((it, idx) => (
                  <li
                    key={`${block.source.id}-${idx}-${it.link.slice(-32)}`}
                    className="text-sm"
                  >
                    <a
                      href={it.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-[var(--text)] hover:text-[var(--accent)]"
                    >
                      <span className="line-clamp-2">{it.title}</span>
                    </a>
                    {formatPpomppuDate(it.pubDate) ? (
                      <div className="mt-0.5 text-[11px] text-[var(--text-muted)]">
                        <time dateTime={it.pubDate ?? undefined}>
                          {formatPpomppuDate(it.pubDate)}
                        </time>
                      </div>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      <p className="mt-4 text-[11px] text-[var(--text-muted)]">
        출처:{" "}
        <a
          href="https://www.ppomppu.co.kr"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--accent)] hover:underline"
        >
          뽐뿌
        </a>
        — 게시물은 각 작성자에게 있습니다.
      </p>
    </section>
  );
}
