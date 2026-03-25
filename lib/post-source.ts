/** 카드·글 하단에서 외부 원문으로 열기 위한 URL (posts.external_url 우선) */

function isHttpUrlString(s: string): boolean {
  const t = s.trim();
  if (!t) return false;
  try {
    const u = new URL(t);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return /^https?:\/\//i.test(t);
  }
}

export function resolveExternalArticleUrl(post: {
  external_url?: string | null;
  source?: string | null;
}): string | null {
  const ext = post.external_url?.trim();
  if (ext && isHttpUrlString(ext)) return ext;

  const src = post.source?.trim();
  if (!src) return null;
  if (isHttpUrlString(src)) return src;

  const m = src.match(/https?:\/\/[^\s<>"']+/);
  if (m?.[0] && isHttpUrlString(m[0])) return m[0];

  return null;
}
