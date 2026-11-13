import React from 'react';
import Link from 'next/link';
import { FeatureSection } from '@/components/ui/FeatureSection';
import { FAQSection } from '@/components/ui/FAQSection';
import { GuideSection } from '@/components/ui/GuideSection';
import { ShieldCheck, Zap, Sparkles, CheckCircle2 } from 'lucide-react';

export const HomeBelowTheFold: React.FC = () => {
  return (
    <div className="w-full space-y-10 pt-6">
      {/* 1. Service Detailed Introduction Section */}
      <section className="sys-card p-6 sm:p-8 space-y-4 bg-white border-slate-200/80 shadow-md rounded-3xl">
        <div className="space-y-2 border-b border-slate-100 pb-4">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
            About Moyeoit
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            모여잇(Moyeoit)은 왜 만들어졌을까요?
          </h2>
        </div>

        <div className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
          <p>
            단톡방에서 끝없는 대화로 약속 날짜를 정하는 번거로움을 줄이기 위해 만들었습니다. 복잡한 회원가입이나 앱 설치 없이 초대 링크 하나로 참여자의 가능 날짜를 모으고 가장 참석률이 높은 후보일을 한눈에 비교할 수 있습니다.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-xs font-black text-slate-900 flex items-center gap-1">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>회원가입 없이 참여</span>
            </span>
            <p className="text-[11px] text-slate-500">초대 링크에서 닉네임만으로 즉시 투표 참여</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-xs font-black text-slate-900 flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>TOP 3 황금 날짜</span>
            </span>
            <p className="text-[11px] text-slate-500">가장 많은 인원이 가능한 날짜 자동 산정</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-xs font-black text-slate-900 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-slate-700" />
              <span>직관적인 참여 히트맵</span>
            </span>
            <p className="text-[11px] text-slate-500">날짜별 참석 비율과 참여자 명단 한눈에 확인</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-xs font-black text-slate-900 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>90일 후 자동 삭제</span>
            </span>
            <p className="text-[11px] text-slate-500">최소 정보만 수집하고 90일 뒤 자동 파기</p>
          </div>
        </div>
      </section>

      {/* 2. Feature & Use-Case Highlights */}
      <FeatureSection />

      {/* 3. Detailed Step-by-Step Guide */}
      <section className="sys-card p-6 sm:p-8 space-y-6 bg-white border-slate-200/80 shadow-md rounded-3xl">
        <div className="space-y-1.5 border-b border-slate-100 pb-4">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
            How It Works
          </span>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
            약속 날짜 조율 4단계 프로세스
          </h2>
          <p className="text-xs text-slate-500">
            방 생성부터 최종 일정 확정·공유까지 한 흐름으로 이어집니다.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <span className="w-7 h-7 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xs font-black">
              1
            </span>
            <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">모임 생성 & 방식 선택</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              방 제목과 날짜 조율 방식(기간 지정 또는 자유 선택)을 설정합니다.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <span className="w-7 h-7 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xs font-black">
              2
            </span>
            <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">단톡방 초대 링크 공유</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              생성된 전용 링크를 카카오톡 단톡방이나 메시지로 공유합니다.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <span className="w-7 h-7 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xs font-black">
              3
            </span>
            <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">가능 날짜 투표</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              참여자는 로그인 없이 닉네임만 입력하고 가능한 날짜를 선택합니다.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <span className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-xs font-black">
              4
            </span>
            <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">황금 날짜 확정 & 공유</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              자동 집계된 황금 날짜와 히트맵을 확인해 방장이 최종 일정을 확정·공유합니다.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Guide Articles Section */}
      <GuideSection />

      {/* 5. FAQ Accordion Section */}
      <FAQSection />

      {/* 6. Navigation Hub Cards Footer Links */}
      <section className="p-6 rounded-3xl bg-slate-900 text-white space-y-4 text-center">
        <h3 className="text-base sm:text-lg font-black tracking-tight">
          더 궁금한 점이나 가이드가 필요하신가요?
        </h3>
        <p className="text-xs text-slate-300 max-w-lg mx-auto">
          모여잇의 상세 가이드 문서와 고객 지원 센터를 방문해 보세요.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/about"
            className="px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/10"
          >
            서비스 소개
          </Link>
          <Link
            href="/help"
            className="px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/10"
          >
            이용 도움말
          </Link>
          <Link
            href="/guide"
            className="px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/10"
          >
            가이드 허브
          </Link>
          <Link
            href="/contact"
            className="px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/10"
          >
            문의하기
          </Link>
        </div>
      </section>
    </div>
  );
};
