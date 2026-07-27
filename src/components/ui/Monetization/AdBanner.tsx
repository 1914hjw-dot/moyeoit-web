'use client';

import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

interface AdBannerProps {
  slotType?: 'top_heatmap' | 'bottom_vote' | 'sidebar';
  className?: string;
}

export const AdBanner: React.FC<AdBannerProps> = ({ slotType = 'bottom_vote', className = '' }) => {
  return (
    <div className={`w-full my-5 ${className}`}>
      <div className="relative overflow-hidden rounded-3xl p-4 sm:p-5 bg-white border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[10px] font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded-full">
                Sponsor
              </span>
              <p className="text-xs font-bold text-slate-900">
                {slotType === 'top_heatmap'
                  ? '모여잇 유저 전용 핫플레이스 파티룸 예약'
                  : '모임 보드게임 & 음료 세트 특가'}
              </p>
            </div>
            <p className="text-xs text-slate-500">
              {slotType === 'top_heatmap'
                ? '강남, 성수, 홍대 모임용 단체 룸예약 최대 30% 할인'
                : '약속 날짜 정해졌다면 준비물 로켓배송 특가 확인'}
            </p>
          </div>
        </div>

        <a
          href="https://m.naver.com"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto shrink-0 px-4 py-2.5 text-xs font-extrabold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-2xl transition-all flex items-center justify-center gap-1 group shadow-sm"
        >
          <span>혜택 보기</span>
          <ArrowRight className="w-3.5 h-3.5 opacity-60 group-hover:translate-x-0.5 transition-transform" />
        </a>
      </div>
    </div>
  );
};
