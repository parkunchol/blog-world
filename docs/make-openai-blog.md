# Make.com + OpenAI → Supabase (posts + category + tags)

최신 프롬프트 전문은 **`prompts/openai-blog-system.txt`** 를 복사해 쓰면 됩니다.

## 한 번에 넣기 (권장): DB 함수 `create_blog_bundle`

Iterator 없이 **HTTP 한 번**이면 됩니다.

1. SQL Editor에서 **`supabase/migrations/20250324150000_rpc_create_blog_bundle.sql`** 실행 (또는 CLI 마이그레이션).
2. Make에서 **HTTP > Make a request** (또는 Supabase에서 RPC 호출 지원 시 동일 URL):

- **Method:** `POST`
- **URL:** `https://<PROJECT_REF>.supabase.co/rest/v1/rpc/create_blog_bundle`
- **Headers:**
  - `apikey`: 프로젝트 **anon** 키
  - `Authorization`: `Bearer <anon 키>`
  - `Content-Type`: `application/json`
  - `Prefer`: `return=minimal` (기본이면 응답 본문에 새 글 `uuid` 한 값만 옴)

- **Body (raw JSON):** 파싱된 OpenAI 객체를 **`payload` 안에** 그대로 넣습니다.

```json
{
  "payload": {
    "title": "…",
    "content": "…",
    "slug": "…",
    "excerpt": "…",
    "published": true,
    "category": { "name": "…", "slug": "…" },
    "tags": [
      { "name": "…", "slug": "…" }
    ]
  }
}
```

응답은 **새 `posts.id` (uuid)** 문자열입니다.  
함수 안에서 `categories` / `tags`는 **`slug` 기준 upsert**, `post_tags`는 중복이면 무시(`on conflict do nothing`)합니다.

**보안:** 이 함수는 **`anon`도 호출 가능**하게 되어 있습니다. anon 키가 노출되면 누구나 글을 마구 넣을 수 있으니, 공개 저장소·클라이언트에 키를 두지 말고, 나중에는 **Edge Function + 공유 시크릿** 또는 **service_role을 Make에만** 두는 방식을 검토하세요.

---

## 테이블 관계

- **`categories`**: `id`, `name`, `slug` (unique)
- **`tags`**: `id`, `name`, `slug` (unique)
- **`posts`**: 기존 컬럼 + **`category_id`** → `categories.id` (nullable)
- **`post_tags`**: `(post_id, tag_id)` 복합 PK — 글과 태그 다대다

마이그레이션: `supabase/migrations/20250324140000_categories_tags.sql`

## OpenAI JSON (모델 출력)

글 본문 필드 + 분류:

| 키 | 설명 |
|----|------|
| `title`, `content`, `slug`, `excerpt`, `published` | 기존과 동일 |
| `category` | `null` 또는 `{ "name", "slug" }` |
| `tags` | `[{ "name", "slug" }, ...]` (빈 배열 가능) |

`slug` 규칙: 소문자 영문·숫자·하이픈만.

## Make에서 권장 순서 (시나리오 예시)

1. OpenAI → JSON 파싱  
2. **Category**: `categories`에 `slug` 기준 upsert(또는 조회) → `category_id` 확보  
3. **Post**: `posts` insert (`title`, `content`, `slug`, `excerpt`, `published`, **`category_id`**) → `post.id` 확보  
4. **Tags**: 각 태그에 대해 `tags` upsert → `tag_id` 목록  
5. **post_tags**: `(post_id, tag_id)` 행들 insert  

`slug` unique 충돌 시 해당 단계에서 실패하므로, 필요하면 OpenAI 프롬프트에 날짜·접미사를 넣도록 안내하세요.

## RLS (이 마이그레이션 기준)

- `categories`, `tags`: 누구나 `SELECT`, **anon `INSERT`** (posts와 같이 자동화용)
- `post_tags`: 발행된 글에 연결된 행만 `SELECT`, **anon `INSERT`**

## 앱 표시

Next.js는 `posts` 조회 시 `categories`·`post_tags`·`tags`를 embed 해 `Post` 타입의 `category`, `tags`로 씁니다 (`lib/posts.ts`).
