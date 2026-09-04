export interface GuideSummary {
  slug: string;
  title: string;
  category: string;
  summary: string;
  description: string;
  publishedAt: string;
  updatedAt: string;
  readTime: string;
  author: string;
  keywords: readonly string[];
}

export const GUIDE_CATALOG = {
  'free-date-selection-guide': {
    slug: 'free-date-selection-guide',
    title: '기간 지정과 자유 날짜 모드, 어떤 모임에 맞을까?',
    category: '날짜 선택 모드',
    summary: '후보 기간이 있는 모임과 아직 기준일이 없는 모임을 구분해 알맞은 조율 방식을 선택하는 가이드입니다.',
    description: '모여잇의 기간 내 선택 모드와 자유 날짜 선택 모드를 실제 모임 상황별로 비교하고, 방을 만들기 전에 확인할 기준을 설명합니다.',
    publishedAt: '2026-08-08',
    updatedAt: '2026-09-04',
    readTime: '6분 읽기',
    author: '모여잇 팀',
    keywords: ['날짜 투표 방식', '기간 지정', '자유 날짜 선택', '모임 일정 조율'],
  },
  'fast-date-picker': {
    slug: 'fast-date-picker',
    title: '친구들과 약속 날짜를 빠르게 정하는 5가지 실전 원칙',
    category: '약속 조율 팁',
    summary: '단톡방에서 같은 질문을 반복하지 않고 후보 선정부터 확정 공지까지 한 번에 끝내는 방법을 정리했습니다.',
    description: '친구 모임의 후보 날짜를 줄이고 응답 마감과 최종 확정을 명확히 하는 일정 조율 방법을 실제 메시지 예시와 함께 설명합니다.',
    publishedAt: '2026-07-28',
    updatedAt: '2026-09-04',
    readTime: '7분 읽기',
    author: '모여잇 팀',
    keywords: ['친구 약속 날짜', '단톡방 일정 조율', '날짜 투표', '약속 잡기'],
  },
  'company-dinner': {
    slug: 'company-dinner',
    title: '직장 팀 회식 일정을 공정하게 조율하는 방법',
    category: '비즈니스 & 회식',
    summary: '업무 일정과 개인 사정을 과도하게 공개하지 않으면서 회식 후보일을 모으고 확정하는 절차입니다.',
    description: '팀 회식 일정 조율 시 후보일 선정, 개인정보를 배려한 응답, 미정 처리, 최종 확정 공지를 체계적으로 진행하는 방법을 설명합니다.',
    publishedAt: '2026-07-27',
    updatedAt: '2026-09-04',
    readTime: '7분 읽기',
    author: '모여잇 팀',
    keywords: ['회식 일정 조율', '팀 회식 날짜', '회사 모임', '직장 일정 투표'],
  },
  'travel-planning': {
    slug: 'travel-planning',
    title: '단체 여행 날짜를 정할 때 숙소 예약까지 놓치지 않는 법',
    category: '여행 & 휴가',
    summary: '연속 가능한 날짜, 이동 시간, 숙소 취소 조건을 함께 고려해 여행 일정을 확정하는 가이드입니다.',
    description: '친구·연인·가족 단체 여행의 날짜를 조율할 때 연속 일정과 예약 마감, 비용 조건을 반영하는 실전 절차를 설명합니다.',
    publishedAt: '2026-07-26',
    updatedAt: '2026-09-04',
    readTime: '7분 읽기',
    author: '모여잇 팀',
    keywords: ['여행 일정 조율', '단체 여행 날짜', '주말 여행', '숙소 예약 일정'],
  },
  'study-group': {
    slug: 'study-group',
    title: '동아리와 스터디 정기 모임 일정을 반복해서 정하는 방법',
    category: '모임 & 스터디',
    summary: '매달 달라지는 수업·면접·아르바이트 일정을 반영하면서 정기 모임의 리듬을 유지하는 운영 방법입니다.',
    description: '동아리와 스터디가 정기적으로 날짜를 조율할 때 응답 마감, 미정 처리, 반복 운영 기록을 활용하는 방법을 설명합니다.',
    publishedAt: '2026-07-25',
    updatedAt: '2026-09-04',
    readTime: '7분 읽기',
    author: '모여잇 팀',
    keywords: ['스터디 일정', '동아리 정기 모임', '모임 출석', '반복 일정 조율'],
  },
  'kakao-share-guide': {
    slug: 'kakao-share-guide',
    title: '카카오톡 단톡방에서 일정 투표 응답을 빠르게 받는 메시지 작성법',
    category: '공유 가이드',
    summary: '링크만 보내지 않고 목적·소요 시간·마감·응답 방법을 한 번에 전달하는 초대 메시지 작성법입니다.',
    description: '카카오톡 단톡방에 모여잇 초대 링크를 공유할 때 참여자가 바로 이해하고 응답할 수 있는 메시지 구성과 재안내 방법을 설명합니다.',
    publishedAt: '2026-07-24',
    updatedAt: '2026-09-04',
    readTime: '6분 읽기',
    author: '모여잇 팀',
    keywords: ['카카오톡 일정 투표', '단톡방 투표', '초대 메시지', '모임 링크 공유'],
  },
} satisfies Record<string, GuideSummary>;

export const GUIDE_SUMMARIES: readonly GuideSummary[] = Object.values(GUIDE_CATALOG);
