'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';

interface AdBannerProps {
  slotType?: 'top_heatmap' | 'bottom_vote' | 'sidebar';
  className?: string;
}

export const AdBanner: React.FC<AdBannerProps> = ({ slotType = 'bottom_vote', className = '' }) => {
  return (
    <div className={`w-full my-6 transition-all ${className}`}>
      <div className="relative overflow-hidden rounded-2xl glass-card border border-purple-500/20 p-4 text-center bg-gradient-to-r from-purple-950/40 via-violet-900/20 to-purple-950/40 shadow-lg">
        <div className="absolute top-2 right-3 flex items-center gap-1 text-[10px] uppercase font-semibold tracking-wider text-purple-400/60 bg-purple-900/40 px-2 py-0.5 rounded-full border border-purple-500/10">
          <Sparkles className="w-3 h-3 text-purple-400" />
          <span>Sponsor</span>
        </div>

        <div className="py-3 px-2 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left">
            <p className="text-xs font-semibold text-purple-300">
              {slotType === 'top_heatmap'
                ? '⚡ 5초 만에 약속 장소 찾기'
                : '🎁 모여잇 유저 전용 특별 혜택'}
            </p>
            <p className="text-sm font-bold text-white mt-0.5">
              {slotType === 'top_heatmap'
                ? '강남/신촌/성수 핫플레이스 파티룸 & 단체 룸예약 최대 30% 할인'
                : '모임 보드게임 & 음료 세트 로켓배송 특가 확인하기'}
            </p>
          </div>

          <a
            href="https://m.naver.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto shrink-0 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl hover:from-purple-500 hover:to-pink-500 transition-all transform hover:scale-105 shadow-md flex items-center justify-center gap-1"
          >
            <span>혜택 구경하기</span>
            <span>→</span>
          </a>
        </div>
      </div>
    </div>
  );
};
