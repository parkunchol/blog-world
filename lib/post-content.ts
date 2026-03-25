/**
 * DB에 저장된 본문에 남아 있을 수 있는 원문/출처 줄(모델·구버전 프롬프트) 제거 — 표시용
 */
export function stripSourceArtifactsFromContent(content: string): string {
  let t = String(content).trimEnd();
  for (let i = 0; i < 8; i++) {
    const before = t;
    t = t.replace(/\n+원문\s*보기\s*:\s*https?:\/\/\S+\s*$/i, "");
    t = t.replace(/\n+원문\s*읽기\s*:\s*https?:\/\/\S+\s*$/i, "");
    t = t.replace(/\n+출처\s*:\s*https?:\/\/\S+\s*$/i, "");
    t = t.replace(/\n+원문\s*보기\s*$/i, "");
    t = t.replace(/\n+원문보기\s*$/i, "");
    t = t.replace(/\s+원문\s*보기\s*$/i, "");
    t = t.replace(/\n+원문\s*읽기\s*$/i, "");
    if (t === before) break;
  }
  return t.trimEnd();
}
