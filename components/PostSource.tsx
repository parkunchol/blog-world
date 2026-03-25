/** 출처 문자열이 http(s) URL이면 외부 링크로 렌더 */

export function isHttpUrl(s: string): boolean {
  const t = s.trim();
  if (!t) return false;
  try {
    const u = new URL(t);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return /^https?:\/\//i.test(t);
  }
}

export function SourceText({
  source,
  className = "",
  /** 원문이 http(s) URL일 때 앵커에 보이는 텍스트 */
  linkLabel = "원문",
}: {
  source: string;
  className?: string;
  linkLabel?: string;
}) {
  const raw = source.trim();
  if (!raw) return null;
  if (isHttpUrl(raw)) {
    return (
      <a
        href={raw}
        target="_blank"
        rel="noopener noreferrer"
        className={`font-medium text-[var(--accent)] hover:underline ${className}`}
      >
        {linkLabel}
      </a>
    );
  }
  return (
    <span className={`font-medium text-[var(--text)] ${className}`}>{raw}</span>
  );
}

/**
 * 본문 하단 — `articleUrl`이 있으면 항상 그 주소로 「원문」링크(카드 메타와 동일).
 * 없고 `source`만 있으면 출처 텍스트.
 */
export function PostSourceFooter({
  source,
  articleUrl,
}: {
  source: string | null | undefined;
  articleUrl: string | null;
}) {
  const url = articleUrl?.trim();
  const raw = source?.trim() ?? "";
  if (!url && !raw) return null;
  if (url) {
    return (
      <footer className="mt-10 border-t border-[var(--border)] pt-6">
        <p className="text-sm leading-relaxed text-[var(--text-muted)]">
          <SourceText source={url} />
        </p>
      </footer>
    );
  }
  return (
    <footer className="mt-10 border-t border-[var(--border)] pt-6">
      <p className="text-sm leading-relaxed text-[var(--text-muted)]">
        <span className="font-medium text-[var(--text)]">출처 </span>
        <SourceText source={raw} />
      </p>
    </footer>
  );
}
