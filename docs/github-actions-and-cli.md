# GitHub CLI · GitHub Actions 설정

이 저장소의 **일일 RSS·DART 적재**(`Daily ingest`)는 GitHub Actions에서 `scripts/ingest-daily.mjs`를 실행합니다. Secrets는 **웹 UI** 또는 **GitHub CLI(`gh`)**로 등록할 수 있습니다.

## GitHub CLI 설치 (Windows)

- **winget:** `winget install --id GitHub.cli`
- **Chocolatey:** `choco install gh`
- **Scoop:** `scoop install gh`
- 또는 [cli.github.com](https://cli.github.com/) 에서 설치 파일 실행

설치 후 새 터미널에서 `gh --version` 으로 확인합니다.

## 인증

처음이면:

```powershell
gh auth login
```

- 계정: `GitHub.com`
- 프로토콜: `HTTPS` (일반적)
- 인증: **Login with a web browser** 권장

확인:

```powershell
gh auth status
```

CI·스크립트만 쓸 때는 [Personal Access Token](https://github.com/settings/tokens)을 만들고 환경 변수 `GH_TOKEN`에 넣어도 됩니다. `gh secret set` 등에는 repo 권한이 필요합니다.

## Secrets와 Variables

| 구분 | 용도 | 워크플로우 참조 |
|------|------|-----------------|
| **Secrets** | API 키, 서비스 롤 등 민감 값 | `${{ secrets.이름 }}` |
| **Variables** | URL·플래그 등 비민감 설정 | `${{ vars.이름 }}` |

Secrets는 로그에 마스킹됩니다. 이 프로젝트의 ingest 워크플로우는 **Secrets 이름**을 아래와 같이 기대합니다.

### 웹에서 등록

저장소 **Settings → Secrets and variables → Actions → New repository secret**

## 이 저장소에 필요한 Secrets (ingest)

워크플로우: `.github/workflows/ingest-daily.yml`

| Secret 이름 | 설명 |
|-------------|------|
| `SUPABASE_URL` | Supabase 프로젝트 URL (예: `https://xxxx.supabase.co`) |
| `SUPABASE_SERVICE_ROLE` | **서비스 롤** 키. anon 키와 다름. 클라이언트·공개 저장소에 넣지 말 것 |
| `DART_API_KEY` | [Open DART](https://opendart.fss.or.kr/) API 인증키 |

서비스 롤은 Supabase 대시보드 **Project Settings → API** 에서 확인합니다.

### 로컬 `.env.local` 과의 대응

Next.js 앱은 보통 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` 를 씁니다. **ingest 스크립트**는 다음만 사용합니다.

- `SUPABASE_URL` ← 프로젝트 URL (로컬의 `NEXT_PUBLIC_SUPABASE_URL`과 같은 값이면 됨)
- `SUPABASE_SERVICE_ROLE` ← 로컬에 없을 수 있음. 대시보드에서 복사해 Secret으로만 보관 권장
- `DART_API_KEY` ← 로컬 `DART_API_KEY` 와 동일 값

anon 키는 ingest에 쓰이지 않으면 Actions Secrets에 넣을 필요가 없습니다.

## `gh`로 Secret 등록

저장소 루트에서 실행합니다. `gh`는 현재 디렉터리의 git 원격 저장소를 기준으로 합니다.

**플래그는 `--body` (하이픈 두 개)** 입니다. `-body` 는 인식되지 않아 오류가 날 수 있습니다.

```powershell
gh secret set SUPABASE_URL --body "https://YOUR_PROJECT.supabase.co"
gh secret set SUPABASE_SERVICE_ROLE --body "YOUR_SERVICE_ROLE"
gh secret set DART_API_KEY --body "YOUR_DART_KEY"
```

짧은 옵션: `-b` 는 `--body` 와 동일합니다.

```powershell
gh secret set DART_API_KEY -b "YOUR_DART_KEY"
```

파일에서 읽기 (파일에 평문이 남으니 사용 후 주의):

```powershell
gh secret set SUPABASE_SERVICE_ROLE --body-file path\to\service-role.txt
```

등록 확인:

```powershell
gh secret list
```

## GitHub Actions: Daily ingest 동작 요약

- **이름:** `Daily ingest (RSS + DART)`
- **트리거**
  - **schedule:** 평일 UTC `07:00` (`cron: "0 7 * * 1-5"`). 한국 시간(장 마감 후 등)에 맞추려면 UTC 시·분을 조정합니다.
  - **workflow_dispatch:** Actions 탭에서 수동 실행 가능
- **실행:** `ubuntu-latest`, Node 20, `npm ci` 후 `node scripts/ingest-daily.mjs`
- **환경 변수:** `SUPABASE_*`, `DART_API_KEY`, `TZ=Asia/Seoul` (KST 기준 날짜 처리)

로컬에서 동일 스크립트를 돌릴 때 (PowerShell):

```powershell
$env:SUPABASE_URL = "..."
$env:SUPABASE_SERVICE_ROLE = "..."
$env:DART_API_KEY = "..."
$env:TZ = "Asia/Seoul"
node scripts/ingest-daily.mjs
```

## 문제 해결

- **`accepts at most 1 arg(s), received 2`:** `--body` 철자와 하이픈 개수를 확인합니다 (`--body` 또는 `-b`).
- **`Please run: gh auth login`:** 위 [인증](#인증) 절차를 수행합니다.
- **워크플로우는 성공하는데 DB가 비어 있음:** Secret 이름이 `SUPABASE_URL` 등과 정확히 일치하는지, 서비스 롤이 anon이 아닌지 확인합니다.
