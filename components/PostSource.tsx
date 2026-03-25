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
}: {
  source: string;
  className?: string;
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
        {raw}
      </a>
    );
  }
  return (
    <span className={`font-medium text-[var(--text)] ${className}`}>{raw}</span>
  );
}

/** 본문 하단 출처 블록 */
export function PostSourceFooter({ source }: { source: string }) {
  const raw = source.trim();
  if (!raw) return null;
  return (
    <footer className="mt-10 border-t border-[var(--border)] pt-6">
      <p className="text-sm leading-relaxed text-[var(--text-muted)]">
        <span className="font-medium text-[var(--text)]">출처 </span>
        <SourceText source={raw} className="break-all" />
      </p>
    </footer>
  );
}
