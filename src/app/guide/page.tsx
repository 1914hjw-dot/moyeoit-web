import React from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, ArrowRight, CheckCircle2 } from '@/components/ui/GuideIcons';
import { GUIDE_SUMMARIES } from '@/content/guide-catalog';
import { Footer } from '@/components/ui/Footer';

export default function GuideHubPage() {
  return (
    <main className="min-h-screen max-w-4xl mx-auto px-4 py-6 space-y-8">
      {/* Header Navigation */}
      <header className="flex items-center justify-between pb-3 border-b border-slate-200/80">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>모여잇 홈으로</span>
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xs shadow-sm">
            <BookOpen className="w-4 h-4" />
          </div>
          <span className="text-xs font-black text-slate-900">가이드 센터</span>
        </div>
      </header>

      {/* Main Content Article */}
      <article className="sys-card p-6 sm:p-10 space-y-8 bg-white border-slate-200/80 shadow-xl shadow-slate-200/50 rounded-3xl">
        <div className="space-y-3 pb-6 border-b border-slate-100">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-extrabold shadow-xs">
            <BookOpen className="w-4 h-4 text-indigo-600" />
            <span>Guide Hub</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            모임 & 약속 조율 실전 가이드 센터
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-semibold leading-relaxed">
            모여잇의 실제 기능 흐름을 바탕으로 후보 선정, 응답 수집, 결과 판단과 확정까지
            단계별로 설명합니다.
          </p>
        </div>

        <section className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-5 space-y-3">
          <h2 className="text-sm font-black text-emerald-950">가이드 편집 원칙</h2>
          <ul className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              '서비스 기능과 일반적인 운영 제안을 구분합니다.',
              '근거 없는 효과 수치나 과장 표현을 쓰지 않습니다.',
              '기능이 달라지면 본문과 수정일을 함께 갱신합니다.',
            ].map((principle) => (
              <li key={principle} className="flex items-start gap-2 text-xs text-emerald-900 leading-5">
                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{principle}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Guide Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {GUIDE_SUMMARIES.map((article) => {
            return (
              <Link
                key={article.slug}
                href={`/guide/${article.slug}`}
                className="group p-5 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 transition-all flex flex-col justify-between space-y-4 shadow-xs"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                      {article.category}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">{article.readTime}</span>
                  </div>

                  <h2 className="text-sm sm:text-base font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
                    {article.title}
                  </h2>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {article.summary}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                  <span className="text-[10px] text-slate-400 font-semibold">
                    {article.updatedAt} 업데이트
                  </span>
                  <span className="flex items-center gap-1 font-extrabold text-indigo-600 group-hover:translate-x-0.5 transition-transform">
                    <span>가이드 전문 읽기</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Bottom Callout */}
        <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-2 text-center">
          <h3 className="text-sm font-black">새로운 모임 방을 만들 준비가 되셨나요?</h3>
          <p className="text-xs text-slate-300">
            가이드의 기준을 적용해 후보 날짜를 정하고 친구들에게 초대 링크를 공유해보세요.
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-slate-900 font-black text-xs hover:bg-slate-100 transition-all cursor-pointer shadow-md"
            >
              <span>약속 방 만들기 홈으로 이동</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-900" />
            </Link>
          </div>
        </div>
      </article>

      <Footer />
    </main>
  );
}
