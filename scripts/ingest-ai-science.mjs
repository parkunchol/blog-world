/**
 * AI·과학 RSS( docs/ai-science.md 소스 ) → OpenAI 요약 → Supabase posts (create_blog_bundle)
 *
 * 피드당 **아직 적재하지 않은** 항목 중 가장 최신 1건을 골라 처리합니다( external_url 중복 방지 ).
 *
 * 환경 변수:
 *   SUPABASE_URL | NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE
 *   OPENAI_API_KEY
 *   OPENAI_MODEL — 기본 gpt-4o-mini
 *
 * 로컬: node scripts/ingest-ai-science.mjs
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import Parser from "rss-parser";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** docs/ai-science.md 기준 피드 */
const FEEDS = [
  {
    id: "aitimes_kr",
    url: "https://www.aitimes.com/rss/allArticle.xml",
    label: "AI타임스",
  },
  {
    id: "hellodd_kr",
    url: "https://www.hellodd.com/rss/allArticle.xml",
    label: "헬로디디",
  },
  {
    id: "scimonitors_kr",
    url: "http://scimonitors.com/feed/",
    label: "사이언스모니터",
  },
  {
    id: "mit_tr_ai",
    url: "https://www.technologyreview.com/topic/artificial-intelligence/feed/",
    label: "MIT Technology Review (AI)",
  },
  {
    id: "sciencedaily",
    url: "https://www.sciencedaily.com/rss/all.xml",
    label: "ScienceDaily",
  },
  {
    id: "wired_science",
    url: "https://www.wired.com/feed/category/science/latest/rss",
    label: "Wired (Science)",
  },
];

const MAX_BODY_CHARS = 14000;

function requireEnv(name) {
  const v = process.env[name]?.trim();
  if (!v) {
    console.error(`Missing env: ${name}`);
    process.exit(1);
  }
  return v;
}

function supabaseUrlFromEnv() {
  return (
    process.env.SUPABASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    null
  );
}

function stripHtml(s) {
  return String(s ?? "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function shortHash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
  return Math.abs(h).toString(36).slice(0, 10);
}

function sortItemsNewestFirst(items) {
  return (items ?? []).slice().sort((a, b) => {
    const ta = new Date(a.isoDate || a.pubDate || 0).getTime();
    const tb = new Date(b.isoDate || b.pubDate || 0).getTime();
    return tb - ta;
  });
}

async function isUrlAlreadyIngested(supabase, url) {
  const { data, error } = await supabase
    .from("posts")
    .select("id")
    .eq("external_url", url)
    .maybeSingle();
  if (error) throw error;
  return !!data;
}

function buildRssItemPayload(feed, item) {
  const link = (item.link ?? "").trim();
  const rawBody = stripHtml(item.content || item["content:encoded"] || item.summary || item.contentSnippet || "");
  const body = rawBody.length > MAX_BODY_CHARS ? `${rawBody.slice(0, MAX_BODY_CHARS)}…` : rawBody;
  return {
    feed_id: feed.id,
    feed_label: feed.label,
    feed_url: feed.url,
    title: (item.title ?? "").trim(),
    link,
    published: item.isoDate || item.pubDate || null,
    guid: item.guid || item.id || null,
    body_plain: body,
  };
}

async function openAiBlogJson(systemPromptPath, rssPayload) {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) throw new Error("OPENAI_API_KEY required");
  const model = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";
  const template = readFileSync(systemPromptPath, "utf8");
  const userContent = template.replace(
    "{{RSS_ITEM_JSON}}",
    JSON.stringify(rssPayload, null, 2),
  );
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: userContent }],
      temperature: 0.35,
      response_format: { type: "json_object" },
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message ?? JSON.stringify(data));
  }
  const text = data.choices?.[0]?.message?.content?.trim() ?? "";
  return { text, model };
}

function parseBundleJson(text) {
  const parsed = JSON.parse(text);
  const required = ["title", "content", "slug"];
  for (const k of required) {
    if (typeof parsed[k] !== "string" || !parsed[k].trim()) {
      throw new Error(`Invalid JSON: missing ${k}`);
    }
  }
  return parsed;
}

/** 프롬프트 이전 버전·모델 실수로 본문 끝에 붙은 원문/URL 줄 제거 */
function stripTrailingSourceLines(content) {
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

async function main() {
  const supabaseUrl = supabaseUrlFromEnv();
  if (!supabaseUrl) {
    console.error("Missing SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL");
    process.exit(1);
  }
  const serviceRole = requireEnv("SUPABASE_SERVICE_ROLE");
  requireEnv("OPENAI_API_KEY");

  const supabase = createClient(supabaseUrl, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const parser = new Parser({
    timeout: 60000,
    headers: {
      "User-Agent": "moa.me-ai-science-ingest/1.0 (+https://github.com)",
    },
  });

  const promptPath = join(__dirname, "../prompts/ai-science-rss.txt");
  let created = 0;
  let skipped = 0;

  for (const feed of FEEDS) {
    let picked;
    try {
      const rss = await parser.parseURL(feed.url);
      const sorted = sortItemsNewestFirst(rss.items);
      picked = null;
      for (const item of sorted) {
        const link = (item.link ?? "").trim();
        if (!link) continue;
        const exists = await isUrlAlreadyIngested(supabase, link);
        if (!exists) {
          picked = item;
          break;
        }
      }
    } catch (e) {
      console.error(`[${feed.id}] RSS fetch failed:`, e.message ?? e);
      continue;
    }

    if (!picked) {
      console.log(`[${feed.id}] no new item (all recent links already ingested)`);
      skipped += 1;
      continue;
    }

    const link = picked.link.trim();
    const rssPayload = buildRssItemPayload(feed, picked);

    let ai;
    try {
      ai = await openAiBlogJson(promptPath, rssPayload);
    } catch (e) {
      console.error(`[${feed.id}] OpenAI failed:`, e.message ?? e);
      continue;
    }

    let bundle;
    try {
      bundle = parseBundleJson(ai.text);
    } catch (e) {
      console.error(`[${feed.id}] JSON parse failed:`, e.message ?? e);
      continue;
    }

    const slugBase = String(bundle.slug)
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 80);
    const slug = `${slugBase || "ai-science"}-${shortHash(link)}`.slice(0, 120);

    const payload = {
      title: bundle.title.trim(),
      content: stripTrailingSourceLines(bundle.content.trim()),
      slug,
      excerpt:
        bundle.excerpt == null
          ? null
          : String(bundle.excerpt).trim() || null,
      published: bundle.published !== false,
      source: link,
      external_url: link,
      category: { name: "AI·과학", slug: "ai-science" },
      tags: Array.isArray(bundle.tags) ? bundle.tags : [],
    };

    const { data: postId, error } = await supabase.rpc("create_blog_bundle", {
      payload,
    });
    if (error) {
      console.error(`[${feed.id}] create_blog_bundle failed:`, error.message ?? error);
      continue;
    }

    console.log(`[${feed.id}] created post ${postId} ← ${link}`);
    created += 1;
    await new Promise((r) => setTimeout(r, 1500));
  }

  console.log(`Done. created=${created}, feeds_with_no_new_item=${skipped}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
