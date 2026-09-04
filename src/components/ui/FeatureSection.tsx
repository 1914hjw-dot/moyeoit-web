import React from 'react';
import { Users, Calendar, Sparkles, ShieldCheck, Zap, HeartHandshake, CheckCircle2, Clock } from 'lucide-react';

export const FeatureSection: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* 1. Practical Use Cases */}
      <section className="sys-card p-6 sm:p-8 space-y-5 bg-white border-slate-200/80 shadow-md rounded-3xl">
        <div className="space-y-1.5 border-b border-slate-100 pb-4">
          <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
            Use Cases
          </span>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
            어떤 상황에서 사용하면 좋은가요?
          </h2>
          <p className="text-xs text-slate-500">
            복잡한 대화나 단톡방 도배 없이 깔끔하게 날짜를 정할 수 있습니다.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
              <Users className="w-4 h-4" />
            </div>
            <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">동아리 & 스터디 정기 모임</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              여러 명의 부원이나 스터디원의 일정을 매주 정할 때, 단톡방 투표 대신 링크 하나로 가장 참석률이 높은 황금 날짜를 도출합니다.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
              <HeartHandshake className="w-4 h-4" />
            </div>
            <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">팀 회식 & 친목 모임</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              바쁜 직장 동료 및 친구들과 회식/약속 날짜를 맞출 때 닉네임 하나로 오차 없이 빠르게 가능한 일자를 파악합니다.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
              <Calendar className="w-4 h-4" />
            </div>
            <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">국내외 여행 & 워크숍 일정</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              연휴나 주말을 활용한 여행 일정을 조율할 때 주말 지정 및 시간대 조율 기능으로 최선의 날짜를 선별합니다.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
              <Clock className="w-4 h-4" />
            </div>
            <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">주말 파티룸 & 프로젝트 회의</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              오전, 오후, 저녁 특정 시간대 대여가 필요한 모임에서 시간대별 세부 가능 여부까지 정교하게 조율합니다.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Core Feature Highlights */}
      <section className="sys-card p-6 sm:p-8 space-y-5 bg-white border-slate-200/80 shadow-md rounded-3xl">
        <div className="space-y-1.5 border-b border-slate-100 pb-4">
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            Core Features
          </span>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
            모여잇이 제공하는 4가지 핵심 기능
          </h2>
          <p className="text-xs text-slate-500">
            사용자 경험(UX)을 가장 최우선으로 설계한 모여잇의 차별점입니다.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="p-2.5 rounded-xl bg-indigo-600 text-white shrink-0 mt-0.5">
              <Zap className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">회원가입 없이 바로 사용</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                아이디 생성, 소셜 로그인, 앱 설치 없이 초대 링크에서 닉네임으로 투표할 수 있습니다.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="p-2.5 rounded-xl bg-emerald-600 text-white shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">최적 날짜 TOP 3 자동 추천</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                참여자 응답 데이터를 바탕으로 가장 많은 인원이 참석 가능한 최적의 날짜 1위, 2위, 3위를 자동으로 산정해 드립니다.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="p-2.5 rounded-xl bg-slate-900 text-white shrink-0 mt-0.5">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">한눈에 보는 직관적 히트맵</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                일자별 참석 인원 비율과 명단을 시각적인 히트맵으로 제공하여 어떤 날에 몇 명이 가능한지 직관적으로 파악할 수 있습니다.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="p-2.5 rounded-xl bg-amber-600 text-white shrink-0 mt-0.5">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">개인정보 최소 수집 원칙 (90일 파기)</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                주민번호나 전화번호 등 불필요한 개인정보를 요구하지 않으며, 모임방 데이터는 생성 90일 후 자동 삭제됩니다.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
