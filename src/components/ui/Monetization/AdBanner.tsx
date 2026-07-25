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
      <div className="relative overflow-hidden rounded-2xl linear-card p-4 bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-900 border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-zinc-800/80 text-amber-400 border border-zinc-700/50 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[10px] uppercase font-bold text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded">
                Sponsor
              </span>
              <p className="text-xs font-bold text-zinc-200">
                {slotType === 'top_heatmap'
                  ? '모여잇 유저 전용 핫플레이스 파티룸 예약'
                  : '모임 보드게임 & 음료 세트 특가'}
              </p>
            </div>
            <p className="text-xs text-zinc-400">
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
          className="w-full sm:w-auto shrink-0 px-3.5 py-2 text-xs font-bold text-zinc-100 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/80 rounded-xl transition-all flex items-center justify-center gap-1 group"
        >
          <span>혜택 보기</span>
          <ArrowRight className="w-3.5 h-3.5 opacity-60 group-hover:translate-x-0.5 transition-transform" />
        </a>
      </div>
    </div>
  );
};
