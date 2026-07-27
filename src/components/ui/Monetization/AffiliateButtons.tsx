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
    <div className="w-full my-6 p-5 sm:p-6 rounded-3xl border border-amber-200/80 bg-amber-50/50 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 rounded-xl bg-amber-100 text-amber-700 border border-amber-200">
          <CalendarCheck className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-sm font-black text-slate-900">
            {formattedDateStr} {timeSlot ? `[${timeSlot}]` : ''} 확정! 모임 장소를 둘러보세요
          </h4>
          <p className="text-xs text-slate-500">
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
          className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-slate-200/80 hover:border-emerald-300 text-emerald-700 transition-all group shadow-sm"
        >
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-emerald-50 text-emerald-600">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-slate-900">네이버 지도 맛집</p>
              <p className="text-[11px] text-slate-500">주변 카페 & 룸식당</p>
            </div>
          </div>
          <ExternalLink className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition-opacity" />
        </a>

        {/* Yanolja / YeogiEottae Partyroom */}
        <a
          href={partyRoomUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-slate-200/80 hover:border-pink-300 text-pink-700 transition-all group shadow-sm"
        >
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-pink-50 text-pink-600">
              <PartyPopper className="w-4 h-4" />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-slate-900">파티룸 & 룸대여</p>
              <p className="text-[11px] text-slate-500">특가 공간 대여</p>
            </div>
          </div>
          <ExternalLink className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition-opacity" />
        </a>

        {/* Coupang Partners Goods */}
        <a
          href={coupangUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-slate-200/80 hover:border-amber-300 text-amber-700 transition-all group shadow-sm"
        >
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-amber-50 text-amber-600">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-slate-900">모임 준비물 & 게임</p>
              <p className="text-[11px] text-slate-500">로켓배송 보드게임</p>
            </div>
          </div>
          <ExternalLink className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition-opacity" />
        </a>
      </div>
    </div>
  );
};
