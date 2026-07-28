import React from 'react';
import Link from 'next/link';
import { BookOpen, ArrowRight, Calendar, Users, Compass, Share2, Sparkles } from 'lucide-react';

export interface GuideArticleMeta {
  slug: string;
  title: string;
  category: string;
  summary: string;
  readTime: string;
  date: string;
  icon: any;
}

export const GUIDE_ARTICLES: GuideArticleMeta[] = [
  {
    slug: 'fast-date-picker',
    title: '친구들과 약속 날짜 빠르게 정하는 5가지 실전 노하우',
    category: '약속 조율 팁',
    summary: '단톡방 피로도 없이 10초 만에 모두가 만족하는 최적의 약속 날짜를 정하는 꿀팁을 공개합니다.',
    readTime: '3분 읽기',
    date: '2026-07-28',
    icon: Sparkles,
  },
  {
    slug: 'company-dinner',
    title: '실패 없는 직장 팀 회식 일정 조율 및 장소 선정 팁',
    category: '비즈니스 & 회식',
    summary: '팀원 전체의 일정을 상처 없이 수집하고 승인받는 효과적인 팀장/간사용 일정 조율 방안.',
    readTime: '4분 읽기',
    date: '2026-07-27',
    icon: Users,
  },
  {
    slug: 'travel-planning',
    title: '친구·연인과 여행 일정 공유 및 주말 날짜 맞추기',
    category: '여행 & 휴가',
    summary: '연휴 및 주말을 활용한 단체 여행 일정을 조율할 때 고려해야 할 핵심 가이드라인.',
    readTime: '3분 읽기',
    date: '2026-07-26',
    icon: Compass,
  },
  {
    slug: 'study-group',
    title: '동아리 & 스터디 정기 모임 날짜 효과적으로 결정하기',
    category: '모임 & 스터디',
    summary: '매주 반복되는 스터디원들의 일정을 잡을 때 시간대별 조율을 활용하여 출석률을 극대화하는 법.',
    readTime: '4분 읽기',
    date: '2026-07-25',
    icon: Calendar,
  },
  {
    slug: 'kakao-share-guide',
    title: '카카오톡 단톡방으로 약속 링크 공유하고 응답률 200% 높이기',
    category: '공유 가이드',
    summary: '초대 링크를 전달할 때 친구들의 즉각적인 투표 참여를 이끌어내는 메시지 작성 가이드.',
    readTime: '3분 읽기',
    date: '2026-07-24',
    icon: Share2,
  },
];

export const GuideSection: React.FC = () => {
  return (
    <section className="sys-card p-6 sm:p-8 space-y-6 bg-white border-slate-200/80 shadow-md rounded-3xl">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-indigo-600">
            <BookOpen className="w-5 h-5" />
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              약속 & 모임 조율 가이드
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            효과적인 일정 조율과 모임 운영에 도움이 되는 실전 노하우입니다.
          </p>
        </div>

        <Link
          href="/guide"
          className="px-3.5 py-1.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-extrabold transition-all flex items-center gap-1 shrink-0"
        >
          <span>전체보기</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {GUIDE_ARTICLES.slice(0, 4).map((article) => {
          return (
            <Link
              key={article.slug}
              href={`/guide/${article.slug}`}
              className="group p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 transition-all flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                    {article.category}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">{article.readTime}</span>
                </div>
                <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
                  {article.title}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {article.summary}
                </p>
              </div>

              <div className="flex items-center gap-1 text-[11px] font-extrabold text-indigo-600 group-hover:translate-x-0.5 transition-transform pt-1">
                <span>가이드 읽기</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};
