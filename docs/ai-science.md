AI와 과학 분야는 정보의 휘발성이 강해서 RSS로 구독해두면 **'모아미'**에 자동 업데이트하기 정말 좋은 소재입니다. 다만, 하나의 완벽한 RSS를 찾기보다 분야별로 신뢰도 높은 소스들을 섞어서 쓰시는 것을 추천합니다.

사용자님의 블로그 성격에 맞게 한국어 소스와 글로벌 소스를 나누어 정리해 드릴게요.

1. 추천 AI & 과학 RSS 소스 (URL 바로 사용 가능)
🇰🇷 국내 (한국어)
AI 타임스 (AI 전문지): https://www.aitimes.com/rss/allArticle.xml

국내외 AI 관련 소식을 가장 빠르게 전하는 전문지입니다.

헬로디디 (과학 기술 전문): https://www.hellodd.com/rss/allArticle.xml

대덕연구단지 기반의 과학 기술 전문 매체로 깊이 있는 과학 뉴스가 많습니다.

사이언스모니터: http://scimonitors.com/feed/

최신 과학 트렌드와 연구 결과를 깔끔하게 정리해 줍니다.

🌐 글로벌 (영문 - AI로 번역/요약 추천)
MIT Technology Review (AI 섹션): https://www.technologyreview.com/topic/artificial-intelligence/feed/

전 세계 AI 트렌드의 본진입니다. 영문이지만 AI(Gemini)로 한글 요약해서 올리면 퀄리티가 엄청나게 올라갑니다.

ScienceDaily (최신 과학): https://www.sciencedaily.com/rss/all.xml

전 세계 논문 기반의 최신 과학 뉴스가 쏟아지는 곳입니다.

Wired (Science): https://www.wired.com/feed/category/science/latest/rss

2. '모아미' 운영을 위한 자동화 팁
이미 Make.com을 쓰고 계시니 아래와 같은 시나리오를 추가해 보세요.

RSS 모듈: 위 URL 중 하나를 연결해 신규 게시물을 감지합니다.

Gemini API (가공): * 영문 소스라면: "이 영문 과학 기사를 한국어로 번역하고, 초등학생도 이해할 수 있게 3줄로 요약해 줘."

국내 소스라면: "이 기사의 핵심 키워드 3개를 뽑고, 독자들이 흥미를 가질만한 제목으로 새로 지어줘."

Supabase: 가공된 제목과 요약문을 category='science'로 저장합니다.

3. 추가하면 '모아미'가 더 풍성해지는 정보들
과학/AI 카테고리라면 이런 정보들도 반응이 좋습니다.

오늘의 우주 사진 (NASA APOD): NASA에서 매일 한 장씩 올리는 고화질 우주 사진 API입니다. 시각적으로 블로그를 매우 예쁘게 만들어줍니다.

arXiv AI 논문 순위: 전 세계 AI 연구자들이 가장 많이 본 논문 초록을 요약해서 보여주면 '테크 전문성'이 확 살아납니다.

기상청 지진/특보 정보: 공공데이터 API로 실시간 과학 정보를 제공할 수 있습니다.

🛠️ 저작권 방어용 프롬프트 보강 (RSS용)
RSS 글을 가져올 때는 원문 링크를 반드시 남겨야 합니다. AI에게 이렇게 시켜보세요.

"이 RSS 피드 내용의 핵심 사실(Fact)만 추출해서 '모아미 뉴스 브리핑' 스타일로 재작성해 줘. 원문의 문장을 그대로 쓰지 말고, 반드시 하단에 '원문 읽기' 링크를 포함하도록 구성해."

이렇게 하면 법적으로 안전하면서도 사용자에게는 친절한 정보가 됩니다.

혹시 영문 RSS를 가져와서 한국어로 깔끔하게 번역해 Supabase에 꽂아주는 Make.com 설정값이 필요하신가요? 아니면 다른 카테고리의 RSS가 더 궁금하신가요?

4. 이 저장소: GitHub Actions + OpenAI + Supabase (블로그 글과 동일 구조)

- **마이그레이션**: `supabase/migrations/20250327120000_posts_external_url_create_blog_bundle.sql` — `posts.external_url`(원문 URL, 중복 방지) 및 `create_blog_bundle`에 `external_url` 반영. **Supabase에 직접 적용**해야 합니다. `git push`만으로 DB 스키마가 바뀌지는 않습니다(대시보드 SQL 또는 `supabase db push` 등).
- **스크립트**: `scripts/ingest-ai-science.mjs` — 위 1절의 6개 피드를 순회하며, **피드마다 아직 `external_url`로 저장하지 않은 항목 중 가장 최신 1건**을 골라 OpenAI로 본문을 만들고 `create_blog_bundle` RPC로 `posts` + 카테고리 `ai-science` + 태그까지 저장합니다.
- **프롬프트**: `prompts/ai-science-rss.txt`
- **워크플로**: `.github/workflows/ai-science-ingest.yml` — **하루 1회**(UTC `0 7 * * *`) 실행. 수동은 Actions에서 **Run workflow**.
- **프론트**: 카테고리 `ai-science` 글은 **`/blog` 목록에 포함되지 않고** **`/ai-science`** 에만 모아서 보여 줍니다.

**적재량(이론상 상한)**: 6피드 × 하루 1회 = **최대 6건/일**, 다만 이미 넣은 URL은 건너뛰므로 실제로는 그보다 적습니다.

**필요 시크릿**: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE`, `OPENAI_API_KEY`. 선택: `OPENAI_MODEL`.

**로컬 실행 예시**:

```powershell
$env:SUPABASE_URL = "https://xxxx.supabase.co"
$env:SUPABASE_SERVICE_ROLE = "..."
$env:OPENAI_API_KEY = "..."
node scripts/ingest-ai-science.mjs
```