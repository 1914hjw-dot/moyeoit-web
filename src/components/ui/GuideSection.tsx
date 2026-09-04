import React from 'react';
import Link from 'next/link';
import { BookOpen, ArrowRight } from 'lucide-react';
import { GUIDE_SUMMARIES } from '@/content/guide-catalog';

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
        {GUIDE_SUMMARIES.slice(0, 4).map((article) => {
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
