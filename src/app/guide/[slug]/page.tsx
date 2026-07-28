'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, BookOpen, Sparkles, ArrowRight } from 'lucide-react';
import { Footer } from '@/components/ui/Footer';

interface ArticleDetailContent {
  slug: string;
  title: string;
  category: string;
  description: string;
  summary?: string;
  date: string;
  readTime: string;
  content: {
    intro: string;
    sections: {
      heading: string;
      body: string;
    }[];
    conclusion: string;
  };
}

const GUIDE_ARTICLES_MAP: Record<string, ArticleDetailContent> = {
  'fast-date-picker': {
    slug: 'fast-date-picker',
    title: '친구들과 약속 날짜 빠르게 정하는 5가지 실전 노하우',
    category: '약속 조율 팁',
    description: '단톡방 피로도 없이 10초 만에 모두가 만족하는 최적의 약속 날짜를 정하는 5가지 실전 노하우를 공개합니다.',
    summary: '단톡방 피로도 없이 10초 만에 모두가 만족하는 최적의 약속 날짜를 정하는 꿀팁을 공개합니다.',
    date: '2026-07-28',
    readTime: '3분 읽기',
    content: {
      intro: '친구들과의 약속을 잡을 때 "언제 만날까?"라는 질문 하나로 단톡방이 수십 개의 메시지로 도배되는 경험, 다들 한 번쯤 있으실 겁니다. 매번 일일이 답장을 읽고 날짜를 대조하는 방식은 소중한 시간과 에너지를 낭비하게 만듭니다. 이번 가이드에서는 단톡방 피로도 없이 10초 만에 깔끔하게 약속 날짜를 확정짓는 실전 노하우를 소개합니다.',
      sections: [
        {
          heading: '1. 후보 날짜는 3~5개 이내로 압축하세요',
          body: '너무 넓은 한 달 단위 선택지를 주면 참여자들의 고민 시간이 길어집니다. 방장은 미리 이번 달 주말이나 차주 평일 중 3~5개의 특정 후보 날짜만 찍어 선택지를 줄이는 것이 좋습니다.',
        },
        {
          heading: '2. 로그인 없는 비회원 조율 툴을 사용하세요',
          body: '투표를 위해 앱을 다운받거나 소셜 로그인을 해야 한다면 응답률이 급격히 떨어집니다. 모여잇(Moyeoit)처럼 회원가입 없이 링크 클릭 후 5초 만에 투표가 가능한 도구를 활용하세요.',
        },
        {
          heading: '3. 안 되는 날짜만 해제하도록 안내하세요',
          body: '모든 날짜를 일일이 클릭하는 것보다 기본 [가능] 상태에서 본인이 절대 불가능한 날짜만 터치하여 해제하도록 안내하면 투표 시간이 80% 이상 단축됩니다.',
        },
        {
          heading: '4. 시각적 히트맵과 자동 1위 산정을 활용하세요',
          body: '투표가 완료되면 실시간 히트맵을 통해 어떤 날에 몇 명이 참석 가능한지 수치화된 데이터로 확인하세요. 모여잇의 TOP 1 자동 추천 기능을 활용하면 논쟁 없이 확정할 수 있습니다.',
        },
        {
          heading: '5. 방장이 최종 날짜를 명확히 선언하세요',
          body: '가장 많은 사람이 참석 가능한 1위 날짜가 도출되면, 방장이 [약속 확정하기] 버튼을 눌러 단톡방에 최종 일정을 명확하게 공지하고 마감하세요.',
        },
      ],
      conclusion: '약속 날짜 조율은 더 이상 스트레스가 아닌 즐거운 모임의 첫걸음이 되어야 합니다. 모여잇을 통해 번거로움 없이 10초 만에 황금 약속 날짜를 정해보세요!',
    },
  },
  'company-dinner': {
    slug: 'company-dinner',
    title: '실패 없는 직장 팀 회식 일정 조율 및 장소 선정 팁',
    category: '비즈니스 & 회식',
    summary: '팀원 전체의 일정을 상처 없이 수집하고 승인받는 효과적인 팀장/간사용 일정 조율 방안.',
    description: '팀원 전체의 일정을 상처 없이 수집하고 승인받는 효과적인 팀장/간사용 직장 회식 일정 조율 가이드입니다.',
    date: '2026-07-27',
    readTime: '4분 읽기',
    content: {
      intro: '직장 회식이나 팀 워크숍 일정 조율은 막내 간사나 팀장님들에게 가장 까다로운 업무 중 하나입니다. 부서원들의 다양한 야근, 개인 사정, 출장 일정을 조율하려면 투명하고 정교한 프로세스가 필수적입니다.',
      sections: [
        {
          heading: '1. 평일 저녁 시간대 조율 옵션을 활용하세요',
          body: '직장 회식은 날짜뿐만 아니라 저녁(18:00~22:00) 시간대 등 세부 일정 확인이 중요합니다. 모여잇의 [날짜 + 시간대] 조율 옵션을 활용하여 특정 시간대 참석 가능 여부를 정확히 파악하세요.',
        },
        {
          heading: '2. 닉네임을 본명으로 기재하도록 요청하세요',
          body: '회사 팀 조율 시 익명보다는 본명이나 직급(예: 김철수 과장)을 기재하도록 안내하면 출석 대조가 훨씬 수월해집니다.',
        },
        {
          heading: '3. 회식 2주 전에 조율 링크를 배포하세요',
          body: '급작스러운 회식 조율은 참석률을 떨어뜨립니다. 최소 2주 전에 모여잇 초대 링크를 팀 채널(스랙, 잔디, 카카오톡)에 공유하고 마감 기한을 지정하세요.',
        },
        {
          heading: '4. 참석 불가능 사유를 한줄 메모로 수집하세요',
          body: '불참자의 경우 한줄 메모 기능을 활용하여 "외근 예정", "개인 연차" 등의 짧은 사유를 수집하면 회식 일정 재조율 시 큰 도움이 됩니다.',
        },
      ],
      conclusion: '체계적인 일정 수집 도구를 활용하면 팀원들의 불만을 최소화하고 모두가 기분 좋게 동의하는 팀 회식 날짜를 결정할 수 있습니다.',
    },
  },
  'travel-planning': {
    slug: 'travel-planning',
    title: '친구·연인과 여행 일정 공유 및 주말 날짜 맞추기',
    category: '여행 & 휴가',
    summary: '연휴 및 주말을 활용한 단체 여행 일정을 조율할 때 고려해야 할 핵심 가이드라인.',
    description: '연휴 및 주말을 활용한 단체 여행 일정을 조율할 때 고려해야 할 핵심 가이드라인입니다.',
    date: '2026-07-26',
    readTime: '3분 읽기',
    content: {
      intro: '주말 1박 2일 여행이나 연휴 맞이 동기 모임 여행은 단순 식사 약속보다 고려해야 할 일정이 깁니다. 숙소 예약과 항공권 발권을 위해 빠른 날짜 확정이 무엇보다 중요합니다.',
      sections: [
        {
          heading: '1. 1박 2일 연속 후보 일자를 묶어서 등록하세요',
          body: '여행은 단일 날짜가 아닌 [토-일] 연속 2일이 가능해야 합니다. 방장은 달력 선택 시 토요일과 일요일이 함께 가능한 조합을 후보 일자로 등록하세요.',
        },
        {
          heading: '2. 이번 달 주말 자동 선택 기능을 이용하세요',
          body: '모여잇의 [이번 달 주말 전체 선택] 버튼을 누르면 당월의 모든 주말 일자가 1초 만에 후보로 등록되어 손쉽게 여행 가능 날짜를 수집할 수 있습니다.',
        },
        {
          heading: '3. 숙소 특가 마감 전 최종 일정을 확정하세요',
          body: '가장 많은 여행 인원이 참석 가능한 TOP 1 황금 날짜가 계산되면 지체 없이 숙소 예약을 진행하여 특가 기회를 놓치지 마세요.',
        },
      ],
      conclusion: '소중한 친구, 연인과의 여행! 약속 날짜 때문에 피곤해하지 말고 모여잇으로 한눈에 결정하세요.',
    },
  },
  'study-group': {
    slug: 'study-group',
    title: '동아리 & 스터디 정기 모임 날짜 효과적으로 결정하기',
    category: '모임 & 스터디',
    summary: '매주 반복되는 스터디원들의 일정을 잡을 때 출석률을 극대화하는 모임 운영 가이드.',
    description: '매주 반복되는 스터디원들의 일정을 잡을 때 출석률을 극대화하는 모임 운영 가이드입니다.',
    date: '2026-07-25',
    readTime: '4분 읽기',
    content: {
      intro: '대학 동아리나 취업 준비 스터디는 인원들의 아르바이트, 수업, 면접 일정이 수시로 변경되므로 매달 정기 모임 날짜를 갱신해 주어야 합니다.',
      sections: [
        {
          heading: '1. 매월 25일 정기 조율 데이를 지정하세요',
          body: '다음 달 모임 일정을 매달 25일경 모여잇 모임방 링크로 조사하면 스터디원들의 미리 스케줄링하는 습관을 형성할 수 있습니다.',
        },
        {
          heading: '2. 미정(세모) 상태를 적극 활용하세요',
          body: '면접이나 알바 스케줄이 아직 확정되지 않은 부원들은 [미정]으로 응답하도록 유도하여 차후 스케줄 변경 시 신속하게 수정할 수 있게 합니다.',
        },
        {
          heading: '3. 히트맵을 스터디 공지사항에 캡처 첨부하세요',
          body: '조율 완료 후 히트맵 화면을 캡처하여 단톡방 공지사항에 등록하면 전원 출석 가능 일자에 대한 투명한 공감대가 형성됩니다.',
        },
      ],
      conclusion: '꾸준한 스터디 운영의 핵심은 원활한 소통과 투명한 일정 조율입니다.',
    },
  },
  'kakao-share-guide': {
    slug: 'kakao-share-guide',
    title: '카카오톡 단톡방으로 약속 링크 공유하고 응답률 200% 높이기',
    category: '공유 가이드',
    summary: '초대 링크를 전달할 때 친구들의 즉각적인 투표 참여를 이끌어내는 메시지 작성 가이드.',
    description: '초대 링크를 전달할 때 친구들의 즉각적인 투표 참여를 이끌어내는 메시지 작성 가이드입니다.',
    date: '2026-07-24',
    readTime: '3분 읽기',
    content: {
      intro: '단톡방에 무심하게 링크만 툭 던져두면 메시지 묻힘 현상이 발생하여 친구들의 응답이 늦어집니다. 읽고 바로 참여하게 만드는 공유 노하우를 소개합니다.',
      sections: [
        {
          heading: '1. 공유 메시지에 명확한 마감 시한을 적으세요',
          body: '예: "오늘 저녁 9시까지만 투표받고 1위 날짜로 모임 확정할게!"처럼 마감 시간을 명시하면 친구들이 미루지 않고 즉시 접속합니다.',
        },
        {
          heading: '2. 카카오톡 전달 시 1초 안내 멘트를 덧붙이세요',
          body: '예: "로그인 필요 없이 본인 이름 치고 안 되는 날짜만 눌러줘!"라는 문구를 덧붙이면 진입 장벽이 완전히 해소됩니다.',
        },
        {
          heading: '3. 모여잇의 초대 링크 복사 버튼을 활용하세요',
          body: '약속방 상단의 [초대 링크 복사하기] 버튼을 누르면 단톡방에 가장 깔끔하게 링크가 공유되며, 카카오톡 썸네일 카드가 예쁘게 생성됩니다.',
        },
      ],
      conclusion: '작은 메시지 작성 팁 하나로 친구들의 응답 속도와 참여율을 2배 이상 높일 수 있습니다.',
    },
  },
};

interface GuideDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default function GuideDetailPage({ params }: GuideDetailPageProps) {
  const { slug } = use(params);
  const article = GUIDE_ARTICLES_MAP[slug];

  if (!article) {
    notFound();
  }

  return (
    <main className="min-h-screen max-w-4xl mx-auto px-4 py-6 space-y-8">
      {/* Header Navigation */}
      <header className="flex items-center justify-between pb-3 border-b border-slate-200/80">
        <Link
          href="/guide"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>가이드 센터로 돌아가기</span>
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xs shadow-sm">
            <BookOpen className="w-4 h-4" />
          </div>
          <span className="text-xs font-black text-slate-900">모여잇 가이드</span>
        </div>
      </header>

      {/* Main Content Article */}
      <article className="sys-card p-6 sm:p-10 space-y-8 bg-white border-slate-200/80 shadow-xl shadow-slate-200/50 rounded-3xl">
        <div className="space-y-3 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
              {article.category}
            </span>
            <span className="text-[11px] text-slate-400 font-semibold">{article.readTime}</span>
            <span className="text-[11px] text-slate-400">• {article.date}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
            {article.title}
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            {article.description}
          </p>
        </div>

        {/* Intro */}
        <div className="text-xs sm:text-sm text-slate-700 leading-relaxed space-y-2">
          <p>{article.content.intro}</p>
        </div>

        <hr className="border-slate-100" />

        {/* Dynamic Sections */}
        <div className="space-y-6">
          {article.content.sections.map((sec, idx) => (
            <section key={idx} className="space-y-2">
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                {sec.heading}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {sec.body}
              </p>
            </section>
          ))}
        </div>

        <hr className="border-slate-100" />

        {/* Conclusion & CTA */}
        <div className="p-5 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-3">
          <h3 className="text-xs sm:text-sm font-extrabold text-indigo-950">💡 마무리하며</h3>
          <p className="text-xs sm:text-sm text-indigo-900 leading-relaxed">
            {article.content.conclusion}
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 text-white font-black text-xs hover:bg-slate-800 transition-all cursor-pointer shadow-md"
            >
              <Sparkles className="w-3.5 h-3.5 text-white" />
              <span>지금 모여잇에서 10초 만에 약속 방 만들기</span>
            </Link>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs font-bold text-slate-600">
          <Link href="/guide" className="hover:text-slate-900 flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>다른 가이드 아티클 둘러보기</span>
          </Link>
          <Link href="/help" className="hover:text-slate-900 flex items-center gap-1">
            <span>이용 도움말 보러가기</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </article>

      <Footer />
    </main>
  );
}
