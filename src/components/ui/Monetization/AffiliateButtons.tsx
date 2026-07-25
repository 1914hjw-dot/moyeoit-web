'use client';

import React from 'react';
import { MapPin, PartyPopper, ShoppingBag, ExternalLink, CalendarCheck } from 'lucide-react';
import { formatKoreanDate } from '@/lib/analytics';

interface AffiliateButtonsProps {
  confirmedDate?: string;
  timeSlot?: string;
}

export const AffiliateButtons: React.FC<AffiliateButtonsProps> = ({
  confirmedDate,
  timeSlot,
}) => {
  const formattedDateStr = confirmedDate ? formatKoreanDate(confirmedDate) : '약속 날짜';
  const queryDate = confirmedDate || '오늘';

  const naverMapUrl = `https://m.map.naver.com/search2/search.naver?query=${encodeURIComponent('맛집')}`;
  const partyRoomUrl = `https://m.yeogi.com/` ;
  const coupangUrl = `https://www.coupang.com/np/search?q=${encodeURIComponent('파티 보드게임 모임용품')}`;

  return (
    <div className="w-full my-6 glass-card p-5 rounded-2xl border border-amber-500/30 bg-gradient-to-b from-amber-950/20 via-purple-950/20 to-black/40">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
          <CalendarCheck className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-base font-bold text-amber-200">
            👉 {formattedDateStr} {timeSlot ? `[${timeSlot}]` : ''} 확정! 어디서 만날까요?
          </h4>
          <p className="text-xs text-purple-300/80">
            날짜가 정해졌다면 지금 장소와 모임 준비물을 추천받아보세요.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
        {/* Naver Map Place Search */}
        <a
          href={naverMapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between p-3 rounded-xl glass-card hover:bg-emerald-950/40 border-emerald-500/30 text-emerald-300 transition-all group"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-emerald-200">네이버 지도 맛집</p>
              <p className="text-[11px] text-emerald-400/70">주변 카페 & 룸식당</p>
            </div>
          </div>
          <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
        </a>

        {/* Yanolja / YeogiEottae Partyroom */}
        <a
          href={partyRoomUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between p-3 rounded-xl glass-card hover:bg-pink-950/40 border-pink-500/30 text-pink-300 transition-all group"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-pink-500/20 text-pink-400">
              <PartyPopper className="w-4 h-4" />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-pink-200">파티룸 & 룸대여</p>
              <p className="text-[11px] text-pink-400/70">최저가 특가 예약</p>
            </div>
          </div>
          <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
        </a>

        {/* Coupang Partners Goods */}
        <a
          href={coupangUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between p-3 rounded-xl glass-card hover:bg-amber-950/40 border-amber-500/30 text-amber-300 transition-all group"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-amber-200">모임 준비물 & 게임</p>
              <p className="text-[11px] text-amber-400/70">로켓배송 보드게임</p>
            </div>
          </div>
          <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
        </a>
      </div>
    </div>
  );
};
