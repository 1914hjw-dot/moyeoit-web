import React from 'react';
import { Users, Calendar, HeartHandshake, Clock } from 'lucide-react';

export const FeatureSection: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Practical Use Cases */}
      <section className="sys-card p-6 sm:p-8 space-y-5 bg-white border-slate-200/80 shadow-md rounded-3xl">
        <div className="space-y-1.5 border-b border-slate-100 pb-4">
          <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
            Use Cases
          </span>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
            어떤 상황에서 사용하면 좋은가요?
          </h2>
          <p className="text-xs text-slate-500">
            단톡방 도배 없이 깔끔하게 모임 일정을 정할 수 있습니다.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
              <Users className="w-4 h-4" />
            </div>
            <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">동아리 & 스터디 정기 모임</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              여러 명의 일정을 정할 때 링크 하나로 참석률이 가장 높은 날짜를 바로 찾습니다.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
              <HeartHandshake className="w-4 h-4" />
            </div>
            <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">팀 회식 & 친목 모임</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              바쁜 동료나 친구들과 닉네임만으로 빠르게 가능한 약속 날짜를 맞춥니다.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
              <Calendar className="w-4 h-4" />
            </div>
            <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">여행 & 워크숍 일정</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              주말 일괄 선택과 시간대 조율로 연휴나 여행에 가장 알맞은 일정을 선별합니다.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
              <Clock className="w-4 h-4" />
            </div>
            <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">주말 파티룸 & 프로젝트 회의</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              오전·오후·저녁 시간대별 가능 여부까지 한 번에 확인해 대여 일정을 정합니다.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
