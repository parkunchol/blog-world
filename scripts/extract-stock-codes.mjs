/**
 * RSS 항목(제목·요약·본문·URL)에서 국내 상장 6자리 종목코드 후보를 추출합니다.
 * YYYYMM 형태(날짜로 흔한 오인) 등은 제외합니다.
 */

const URL_QUERY_KEYS = [
  "code",
  "stockCode",
  "stock_code",
  "scd",
  "stk_cd",
  "itemCode",
  "isuCd",
  "isu_cd",
];

/** HTML 태그 제거 후 공백 정리 */
export function stripHtml(html) {
  if (!html || typeof html !== "string") return "";
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * 6자리 숫자가 YYYYMM(2000~2035년, 01~12월)처럼 보이면 종목코드에서 제외
 * (예: 기사 날짜 202503 등 오탐 감소)
 */
export function looksLikeYYYYMM(six) {
  if (!/^\d{6}$/.test(six)) return false;
  const y = Number(six.slice(0, 4));
  const m = Number(six.slice(4, 6));
  return y >= 2000 && y <= 2035 && m >= 1 && m <= 12;
}

/** 본문에서 6자리 숫자 덩어리(앞뒤 비숫자) 수집 */
export function extractSixDigitCodesFromText(text) {
  if (!text) return [];
  const re = /(?<![0-9])(\d{6})(?![0-9])/g;
  const out = [];
  let m;
  while ((m = re.exec(text)) !== null) {
    const code = m[1];
    if (looksLikeYYYYMM(code)) continue;
    out.push(code);
  }
  return out;
}

/**
 * 괄호 안 종목코드 (005930) — 한국 기사에서 흔함
 */
export function extractParenthesizedCodes(text) {
  if (!text) return [];
  const re = /\(\s*(\d{6})\s*\)/g;
  const out = [];
  let m;
  while ((m = re.exec(text)) !== null) {
    const code = m[1];
    if (looksLikeYYYYMM(code)) continue;
    out.push(code);
  }
  return out;
}

/** URL 쿼리·경로에서 종목코드 후보 */
export function extractCodesFromUrl(urlString) {
  if (!urlString || typeof urlString !== "string") return [];
  const out = [];
  try {
    const u = new URL(urlString);
    for (const key of URL_QUERY_KEYS) {
      const v = u.searchParams.get(key);
      if (v && /^\d{6}$/.test(v) && !looksLikeYYYYMM(v)) out.push(v);
    }
    // /A005930/, /item/005930/, ...stock/005930...
    const path = `${u.pathname}${u.hash ?? ""}`;
    const pathRe = /(?:^|\/)(A)(\d{6})(?:\/|$|[?#])/gi;
    let m;
    while ((m = pathRe.exec(path)) !== null) {
      const code = m[2];
      if (!looksLikeYYYYMM(code)) out.push(code);
    }
    const plainPath = /(?:^|\/)(\d{6})(?:\/|$|[?#])/g;
    while ((m = plainPath.exec(path)) !== null) {
      const code = m[1];
      if (looksLikeYYYYMM(code)) continue;
      out.push(code);
    }
  } catch {
    // 상대 URL 등
    const abs = urlString.match(/[?&](?:code|stockCode|stock_code)=(\d{6})\b/i);
    if (abs?.[1] && !looksLikeYYYYMM(abs[1])) out.push(abs[1]);
  }
  return out;
}

/**
 * rss-parser item + link 로부터 고유 종목코드 배열 (오름차순)
 * @param {import('rss-parser').Item} item
 * @param {string} link
 */
export function extractStockCodesFromRssItem(item, link) {
  const title = (item.title ?? "").trim();
  const snippet = (item.contentSnippet ?? item.summary ?? "").trim();
  const rawContent =
    item.content ??
    item["content:encoded"] ??
    item["content:encodedSnippet"] ??
    "";
  const content = stripHtml(
    typeof rawContent === "string" ? rawContent : String(rawContent),
  );

  const blob = [title, snippet, content, link].filter(Boolean).join("\n");

  const fromText = extractSixDigitCodesFromText(blob);
  const fromParen = extractParenthesizedCodes(blob);
  const fromUrl = extractCodesFromUrl(link);

  const set = new Set([...fromText, ...fromParen, ...fromUrl]);
  return [...set].sort();
}
