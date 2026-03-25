import { unstable_cache } from "next/cache";

/** KST 기준 달력 날짜 YYYY-MM-DD */
export function getKstYmd(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h) >>> 0;
}

function pick<T>(arr: readonly T[], seed: number): T {
  return arr[seed % arr.length];
}

/** 공통 한 줄 (날짜만 바뀌면 교체) */
const GENERAL_LINES = [
  "작은 실천이 큰 만족으로 이어지기 좋은 날입니다.",
  "주변과 호흡을 맞추면 일이 수월해집니다.",
  "정리와 결정을 나눠 하면 부담이 줄어듭니다.",
  "새로운 시도보다 기반을 다지기에 유리한 흐름입니다.",
  "잠깐 멈추고 우선순위를 적어 보면 길이 보입니다.",
  "말보다 행동 한 번이 신뢰를 만듭니다.",
  "배움과 질문이 열릴 때입니다.",
  "몸의 신호를 무시하지 말고 가볍게 돌보세요.",
  "관계에서는 경청이 행운을 부릅니다.",
  "작은 약속을 지키면 하루가 단단해집니다.",
  "집중이 흐트러질 땐 타이머 하나로 충분합니다.",
  "감사 표현이 하루의 온도를 올립니다.",
  "정보는 확인하고, 결정은 천천히.",
  "오늘은 ‘완벽’보다 ‘완료’가 더 값집니다.",
  "가까운 사람에게 먼저 연락해 보세요.",
  "실수는 고치면 되고, 숨기면 커집니다.",
  "짧은 산책이 생각을 정돈합니다.",
  "재미있게 끝내려 하기보다 끝까지 하면 재미가 남습니다.",
  "남의 속도에 맞추지 말고 내 페이스를 지키세요.",
  "작은 칭찬이 분위기를 바꿉니다.",
] as const;

const KEYWORDS = [
  "균형",
  "호흡",
  "정리",
  "집중",
  "경청",
  "실천",
  "신뢰",
  "여유",
  "연결",
  "완료",
  "감사",
  "확인",
  "단단함",
  "온도",
  "우선순위",
  "회복",
  "경계",
  "유연",
  "발견",
  "정돈",
] as const;

/** 별자리별 한 줄 풀 (참고·재미용 문구) */
const SIGN_LINES: Record<string, readonly string[]> = {
  양자리: [
    "추진력이 살아나니 시작을 미루지 말아 보세요.",
    "솔직한 표현이 관계를 가볍게 합니다.",
    "속도 조절만 하면 무리 없이 나아갑니다.",
  ],
  황소자리: [
    "안정을 우선하면 선택이 쉬워집니다.",
    "감각적인 만족이 작은 보상이 됩니다.",
    "변화보다 지속에 힘이 있습니다.",
  ],
  쌍둥이자리: [
    "대화에서 실마리가 보입니다.",
    "정보를 나눌수록 판단이 선명해집니다.",
    "짧고 명확한 연락이 이깁니다.",
  ],
  게자리: [
    "마음이 먼저 가는 곳에 시간을 쓰세요.",
    "익숙한 곳에서 위로를 얻기 좋습니다.",
    "따뜻한 한 끼가 기분을 바꿉니다.",
  ],
  사자자리: [
    "주목받을 일이 생기니 준비된 모습이 도움됩니다.",
    "자신감은 과시보다 차분함에서 나옵니다.",
    "리더보다 조율자 역할이 빛납니다.",
  ],
  처녀자리: [
    "디테일이 살아날 때입니다. 체크리스트를 활용해 보세요.",
    "정리가 곧 속도입니다.",
    "작은 습관을 고치면 하루가 달라집니다.",
  ],
  천칭자리: [
    "균형을 맞추려 하기보다 우선 하나를 고르세요.",
    "미적 감각이 살아납니다.",
    "중재가 필요한 자리에서 도움이 됩니다.",
  ],
  전갈자리: [
    "핵심만 파고들면 빠르게 정리됩니다.",
    "깊은 대화가 에너지를 줍니다.",
    "숨은 정보를 확인해 보세요.",
  ],
  사수자리: [
    "넓게 보고 가볍게 시도해 보기 좋습니다.",
    "여행·이동·배움에 긍정적입니다.",
    "유머가 긴장을 풉니다.",
  ],
  염소자리: [
    "목표를 쪼개면 부담이 줄어듭니다.",
    "책임감이 신뢰로 이어집니다.",
    "장기적으로 보면 오늘의 선택이 빛납니다.",
  ],
  물병자리: [
    "새로운 아이디어가 떠오르니 메모해 두세요.",
    "남다른 시선이 강점이 됩니다.",
    "공동체·모임에서 기회가 있습니다.",
  ],
  물고기자리: [
    "감수성이 풍부해지니 휴식도 계획에 넣으세요.",
    "직감을 믿되 확인은 거치면 좋습니다.",
    "예술·음악이 기분을 돋웁니다.",
  ],
};

/** 십이지(띠) — 참고·재미용 문구 (양력 띠 기준이 아닌 보통 표기) */
const DDI_LINES: Record<string, readonly string[]> = {
  쥐: [
    "재치 있는 대처가 분위기를 부드럽게 합니다.",
    "작은 기회를 놓치지 말고 메모해 두세요.",
    "정보를 모으면 판단이 빨라집니다.",
  ],
  소: [
    "꾸준함이 신뢰로 이어지는 날입니다.",
    "무리한 확장보다 기본을 다지기 좋습니다.",
    "몸이 보내는 신호를 가볍게라도 돌보세요.",
  ],
  호랑이: [
    "주도할 일이 생기니 말과 행동을 맞추세요.",
    "용기는 좋지만 돌발만 조심하면 됩니다.",
    "새로운 제안은 조건을 확인하고 결정하세요.",
  ],
  토끼: [
    "섬세한 배려가 관계를 돕습니다.",
    "갈등은 시간을 두고 말하면 풀립니다.",
    "취미·휴식에 소소한 행운이 있습니다.",
  ],
  용: [
    "큰 그림을 보되 실행은 한 걸음씩.",
    "기대가 커질수록 현실 점검도 함께하세요.",
    "주변을 끌어주는 말 한마디가 빛납니다.",
  ],
  뱀: [
    "관찰이 통찰로 이어집니다.",
    "속마음을 조금만 드러내도 호감이 생깁니다.",
    "집중이 필요한 일은 방해를 줄이세요.",
  ],
  말: [
    "움직임이 곧 기회입니다. 미루지 말아 보세요.",
    "활동량이 늘면 컨디션 관리도 챙기세요.",
    "솔직한 소통이 속도를 냅니다.",
  ],
  양: [
    "포용이 분위기를 부드럽게 만듭니다.",
    "나만의 리듬을 지키면 마음이 편합니다.",
    "작은 선물·칭찬이 큰 기쁨이 됩니다.",
  ],
  원숭이: [
    "재치 있는 아이디어가 통할 때입니다.",
    "유머로 긴장을 풀면 일이 술술 풀립니다.",
    "여러 가지를 동시에 하려다 보니 우선순위를 정하세요.",
  ],
  닭: [
    "꼼꼼함이 실수를 줄여 줍니다.",
    "계획을 세우면 마음이 가벼워집니다.",
    "자기 주장과 경청의 균형을 맞추세요.",
  ],
  개: [
    "의리와 성실이 빛을 봅니다.",
    "약속을 지키면 신뢰가 쌓입니다.",
    "가까운 사람에게 먼저 안부를 나눠 보세요.",
  ],
  돼지: [
    "여유와 풍요로운 기운이 감돕니다.",
    "나눔이 기분을 좋게 만듭니다.",
    "욕심보다 만족에 초점을 맞추면 편합니다.",
  ],
};

export const DDI_ORDER = [
  "쥐",
  "소",
  "호랑이",
  "토끼",
  "용",
  "뱀",
  "말",
  "양",
  "원숭이",
  "닭",
  "개",
  "돼지",
] as const;

export const ZODIAC_ORDER = [
  "양자리",
  "황소자리",
  "쌍둥이자리",
  "게자리",
  "사자자리",
  "처녀자리",
  "천칭자리",
  "전갈자리",
  "사수자리",
  "염소자리",
  "물병자리",
  "물고기자리",
] as const;

export type DailyFortuneSign = {
  name: (typeof ZODIAC_ORDER)[number];
  line: string;
};

export type DailyFortuneDdi = {
  name: (typeof DDI_ORDER)[number];
  label: string;
  line: string;
};

export type DailyFortune = {
  dateKst: string;
  /** 모두에게 같은 날짜 기준 공통 한 줄 */
  general: string;
  keyword: string;
  signs: DailyFortuneSign[];
  /** 십이지 띠별 한 줄 */
  ddi: DailyFortuneDdi[];
};

function computeFortune(ymd: string): DailyFortune {
  const base = hashSeed(`themoa-fortune-${ymd}`);
  const general = pick(GENERAL_LINES, base);
  const keyword = pick(KEYWORDS, base + 7);

  const signs: DailyFortuneSign[] = ZODIAC_ORDER.map((name, i) => {
    const lines = SIGN_LINES[name];
    const line = pick(lines, base + i * 31 + 3);
    return { name, line };
  });

  const ddi: DailyFortuneDdi[] = DDI_ORDER.map((name, i) => {
    const lines = DDI_LINES[name];
    const line = pick(lines, base + i * 41 + 11);
    return { name, label: `${name}띠`, line };
  });

  return { dateKst: ymd, general, keyword, signs, ddi };
}

export async function getDailyFortune(): Promise<DailyFortune> {
  const ymd = getKstYmd();
  return unstable_cache(
    async () => computeFortune(ymd),
    /** 스키마(띠 추가 등) 바꿀 때마다 버전 올려 기존 캐시 무효화 */
    ["daily-fortune", "v2-ddi", ymd],
    { revalidate: 86400, tags: ["daily-fortune"] },
  )();
}
