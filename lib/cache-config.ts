const parsed = parseInt(process.env.CACHE_REVALIDATE_SECONDS ?? "", 10);

/** 서버 전용. 블로그 공개 데이터 unstable_cache 재검증 주기(초). 기본 60, 최소 10. */
export const CACHE_REVALIDATE_SECONDS =
  Number.isFinite(parsed) && parsed >= 10 ? parsed : 60;
