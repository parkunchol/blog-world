/**
 * 장 마감 후 일 1회: RSS 메타 + Open DART 당일 list 메타 → Supabase upsert
 *
 * 환경 변수:
 *   SUPABASE_URL (없으면 NEXT_PUBLIC_SUPABASE_URL 사용)
 *   SUPABASE_SERVICE_ROLE
 *   DART_API_KEY
 *
 * 로컬: TZ=Asia/Seoul node scripts/ingest-daily.mjs
 */

import { createClient } from "@supabase/supabase-js";
import Parser from "rss-parser";
import { extractStockCodesFromRssItem } from "./extract-stock-codes.mjs";

const RSS_FEEDS = [
  { id: "yna_market", url: "https://www.yna.co.kr/rss/market.xml" },
  { id: "yna_economy", url: "https://www.yna.co.kr/rss/economy.xml" },
  { id: "infomax_sec", url: "https://news.einfomax.co.kr/rss/S1N2.xml" },
];

/** DART list.json report_nm — 아래 문자열이 하나라도 포함될 때만 적재 (필요 시 목록 조정) */
const DART_REPORT_KEYWORDS = [
  "IR",
  "기업설명서",
  "투자설명서",
  "유상증자",
  "유증",
  "신주인수권",
  "수주",
  "단일판매",
  "공급계약",
];

function isDartReportOfInterest(reportNm) {
  const s = (reportNm ?? "").trim();
  if (!s) return false;
  return DART_REPORT_KEYWORDS.some((k) => s.includes(k));
}

function requireEnv(name) {
  const v = process.env[name]?.trim();
  if (!v) {
    console.error(`Missing env: ${name}`);
    process.exit(1);
  }
  return v;
}

/** KST 기준 달력 날짜 YYYYMMDD */
function kstYmdCompact(d = new Date()) {
  const s = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
  return s.replace(/-/g, "");
}

/** 해당 instant가 KST 기준으로 ymdCompact(YYYYMMDD)와 같은 날인지 */
function isSameKstDay(isoUtc, ymdCompact) {
  const s = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(isoUtc));
  return s.replace(/-/g, "") === ymdCompact;
}

/** DART YYYYMMDD → Postgres date 문자열 */
function dartYmdToIsoDate(ymd) {
  if (!ymd || String(ymd).length !== 8) return null;
  const y = ymd.slice(0, 4);
  const m = ymd.slice(4, 6);
  const day = ymd.slice(6, 8);
  return `${y}-${m}-${day}`;
}

/** 금융감독원 DART 공시 화면 (list API에는 url이 없어 접수번호로 조합) */
function dartViewerUrl(rceptNo) {
  const q = encodeURIComponent(String(rceptNo).trim());
  return `https://dart.fss.or.kr/dsaf001/main.do?rcpNo=${q}`;
}

async function fetchDartListPage(apiKey, ymd, pageNo) {
  const u = new URL("https://opendart.fss.or.kr/api/list.json");
  u.searchParams.set("crtfc_key", apiKey);
  u.searchParams.set("bgn_de", ymd);
  u.searchParams.set("end_de", ymd);
  u.searchParams.set("page_no", String(pageNo));
  u.searchParams.set("page_count", "100");
  const res = await fetch(u);
  const data = await res.json();
  return data;
}

async function ingestDart(supabase, apiKey, ymd) {
  const rows = [];
  let rawCount = 0;
  let skippedNoStockCode = 0;
  let page = 1;
  let totalPage = 1;
  do {
    const data = await fetchDartListPage(apiKey, ymd, page);
    if (data.status !== "000") {
      console.error("DART API:", data.message || data);
      process.exit(1);
    }
    totalPage = Number(data.total_page) || 1;
    const list = data.list || [];
    rawCount += list.length;
    for (const x of list) {
      const report_nm = (x.report_nm ?? "").trim() || "(제목없음)";
      if (!isDartReportOfInterest(report_nm)) continue;
      const stock_code = String(x.stock_code ?? "").trim();
      if (!stock_code) {
        skippedNoStockCode += 1;
        continue;
      }
      const iso = dartYmdToIsoDate(x.rcept_dt);
      if (!iso) continue;
      const corp_code = String(x.corp_code ?? "").trim();
      if (!corp_code) continue;
      const rcept_no = String(x.rcept_no).trim();
      rows.push({
        rcept_no,
        rcept_dt: iso,
        corp_code,
        corp_name: x.corp_name?.trim() || null,
        report_nm,
        stock_code,
        url: dartViewerUrl(rcept_no),
      });
    }
    page += 1;
  } while (page <= totalPage);

  const chunk = 200;
  for (let i = 0; i < rows.length; i += chunk) {
    const part = rows.slice(i, i + chunk);
    const { error } = await supabase.from("dart_filings").upsert(part, {
      onConflict: "rcept_no",
      ignoreDuplicates: false,
    });
    if (error) {
      console.error("dart_filings upsert:", error);
      process.exit(1);
    }
  }
  console.log(
    `DART: ${rows.length} upserted, ${skippedNoStockCode} skipped (no stock_code), ${rawCount} raw (date ${ymd})`,
  );
}

async function ingestRss(supabase, ymdCompact) {
  const parser = new Parser({ timeout: 20000 });
  let totalUpserted = 0;
  let totalSkippedNoCode = 0;
  for (const { id: feed_id, url } of RSS_FEEDS) {
    const feed = await parser.parseURL(url);
    const rows = [];
    let skippedNoCode = 0;
    for (const item of feed.items ?? []) {
      const link = item.link?.trim();
      if (!link) continue;
      const external_id = String(item.guid || link).trim();
      const title = (item.title ?? "").trim() || "(제목없음)";
      const pub = item.isoDate || item.pubDate;
      if (!pub) continue;
      const published_at = new Date(pub).toISOString();
      if (!isSameKstDay(published_at, ymdCompact)) continue;
      const stock_codes = extractStockCodesFromRssItem(item, link);
      if (!stock_codes.length) {
        skippedNoCode += 1;
        continue;
      }
      rows.push({
        feed_id,
        external_id,
        url: link,
        title,
        published_at,
        stock_codes,
      });
    }
    const chunk = 200;
    for (let i = 0; i < rows.length; i += chunk) {
      const part = rows.slice(i, i + chunk);
      const { error } = await supabase.from("rss_items").upsert(part, {
        onConflict: "feed_id,external_id",
        ignoreDuplicates: false,
      });
      if (error) {
        console.error("rss_items upsert:", feed_id, error);
        process.exit(1);
      }
    }
    totalUpserted += rows.length;
    totalSkippedNoCode += skippedNoCode;
    console.log(
      `RSS ${feed_id}: ${rows.length} upserted, ${skippedNoCode} skipped (no stock_codes)`,
    );
  }
  console.log(
    `RSS total: ${totalUpserted} upserted, ${totalSkippedNoCode} skipped no code (feeds=${RSS_FEEDS.length})`,
  );
}

function supabaseUrlFromEnv() {
  const direct = process.env.SUPABASE_URL?.trim();
  if (direct) return direct;
  const fromNext = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (fromNext) return fromNext;
  console.error("Missing env: SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL)");
  process.exit(1);
}

async function main() {
  const supabaseUrl = supabaseUrlFromEnv();
  const serviceRole = requireEnv("SUPABASE_SERVICE_ROLE");
  const dartKey = requireEnv("DART_API_KEY");

  const supabase = createClient(supabaseUrl, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const ymd = kstYmdCompact();
  await ingestRss(supabase, ymd);
  await ingestDart(supabase, dartKey, ymd);
  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
