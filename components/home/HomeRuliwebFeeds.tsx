import Link from "next/link";
import {
  formatRuliwebDate,
  getRuliwebFeeds,
} from "@/lib/ruliweb-feeds";

export async function HomeRuliwebFeeds() {
  const feeds = await getRuliwebFeeds();

  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm sm:p-6">
      <div className="border-b border-[var(--border)] pb-3">
        <h2 className="text-lg font-semibold text-[var(--text)]">루리웹</h2>
        <p className="mt-0.5 text-xs text-[var(--text-muted)]">
          RSS만 사용 · 약 5분 캐시 · 제목 클릭 시 해당 글로 이동합니다.
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
                    key={`${block.source.id}-${idx}-${it.link.slice(-24)}`}
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
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-[var(--text-muted)]">
                      {it.category ? (
                        <span className="rounded bg-[var(--surface-muted)] px-1.5 py-0.5">
                          {it.category}
                        </span>
                      ) : null}
                      {formatRuliwebDate(it.pubDate) ? (
                        <time dateTime={it.pubDate ?? undefined}>
                          {formatRuliwebDate(it.pubDate)}
                        </time>
                      ) : null}
                    </div>
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
          href="https://bbs.ruliweb.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--accent)] hover:underline"
        >
          루리웹
        </a>
        — 게시물 저작권은 각 작성자·운영 정책에 따릅니다.
      </p>
    </section>
  );
}
