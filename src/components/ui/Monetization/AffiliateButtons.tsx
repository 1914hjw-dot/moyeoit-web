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

  const naverMapUrl = `https://m.map.naver.com/search2/search.naver?query=${encodeURIComponent('맛집')}`;
  const partyRoomUrl = `https://m.yeogi.com/`;
  const coupangUrl = `https://www.coupang.com/np/search?q=${encodeURIComponent('파티 보드게임 모임용품')}`;

  return (
    <div className="w-full my-6 linear-card p-5 border-amber-500/30 bg-zinc-900/90">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <CalendarCheck className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-zinc-100">
            {formattedDateStr} {timeSlot ? `[${timeSlot}]` : ''} 확정! 모임 장소를 둘러보세요
          </h4>
          <p className="text-xs text-zinc-400">
            날짜가 정해졌다면 주변 핫플레이스 맛집 및 파티룸을 추천해 드립니다.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-3">
        {/* Naver Map Place Search */}
        <a
          href={naverMapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 hover:border-emerald-500/40 text-emerald-300 transition-all group"
        >
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-400">
              <MapPin className="w-3.5 h-3.5" />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-zinc-200">네이버 지도 맛집</p>
              <p className="text-[11px] text-zinc-500">주변 카페 & 룸식당</p>
            </div>
          </div>
          <ExternalLink className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition-opacity" />
        </a>

        {/* Yanolja / YeogiEottae Partyroom */}
        <a
          href={partyRoomUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 hover:border-pink-500/40 text-pink-300 transition-all group"
        >
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-pink-500/10 text-pink-400">
              <PartyPopper className="w-3.5 h-3.5" />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-zinc-200">파티룸 & 룸대여</p>
              <p className="text-[11px] text-zinc-500">특가 공간 대여</p>
            </div>
          </div>
          <ExternalLink className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition-opacity" />
        </a>

        {/* Coupang Partners Goods */}
        <a
          href={coupangUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 hover:border-amber-500/40 text-amber-300 transition-all group"
        >
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-400">
              <ShoppingBag className="w-3.5 h-3.5" />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-zinc-200">모임 준비물 & 게임</p>
              <p className="text-[11px] text-zinc-500">로켓배송 보드게임</p>
            </div>
          </div>
          <ExternalLink className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition-opacity" />
        </a>
      </div>
    </div>
  );
};
