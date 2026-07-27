'use client';

import React, { useState } from 'react';
import { Room, HeatmapCellData } from '@/types/schema';
import { formatKoreanDate } from '@/lib/analytics';
import { LayoutGrid, ChevronDown, ChevronUp, UserCheck, HelpCircle, UserX, X } from 'lucide-react';

interface HeatmapGridProps {
  room: Room;
  heatmapMap: Record<string, HeatmapCellData>;
  totalVotersCount: number;
}

export const HeatmapGrid: React.FC<HeatmapGridProps> = ({
  room,
  heatmapMap,
  totalVotersCount,
}) => {
  const [selectedCell, setSelectedCell] = useState<HeatmapCellData | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const cells = Object.values(heatmapMap);

  if (cells.length === 0) return null;

  const getHeatmapBg = (ratio: number, count: number) => {
    if (count === 0) return 'bg-slate-50 text-slate-400 border-slate-200';
    if (ratio === 1) return 'bg-emerald-600 text-white border-emerald-700 font-extrabold shadow-xs';
    if (ratio >= 0.66) return 'bg-emerald-100 text-emerald-950 border-emerald-300 font-bold';
    if (ratio >= 0.33) return 'bg-amber-100 text-amber-950 border-amber-300 font-semibold';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <div className="w-full sys-card p-4 sm:p-5 space-y-4 my-4 bg-white border-slate-200/80 shadow-sm rounded-3xl">
      {/* Collapsible Section Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between cursor-pointer select-none text-left"
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200">
            <LayoutGrid className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight">
              📊 전체 참여자 응답 현황 (히트맵)
            </h3>
            <p className="text-[11px] text-slate-400">
              {isExpanded ? '클릭하여 히트맵 접기' : '모든 참여자의 가능 날짜 한눈에 확인하기'}
            </p>
          </div>
        </div>

        <span className="text-xs font-extrabold text-slate-800 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-2xl flex items-center gap-1 shrink-0 shadow-xs hover:bg-slate-200 transition-all">
          <span>{isExpanded ? '접기' : '펼쳐보기'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </span>
      </button>

      {/* Accordion / Collapsible Container */}
      {isExpanded && (
        <div className="space-y-4 pt-3 border-t border-slate-100 animate-in fade-in duration-200">
          <p className="text-xs text-slate-500">
            날짜 카드를 클릭하면 해당 일자의 참석자/불참자 상세 명단을 확인할 수 있습니다.
          </p>

          {/* Grid Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {cells.map((cell) => {
              const bgClass = getHeatmapBg(cell.ratio, cell.possible_count);
              return (
                <button
                  key={cell.key}
                  type="button"
                  onClick={() => setSelectedCell(cell)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${bgClass}`}
                >
                  <span className="text-[11px] font-bold block truncate">
                    {formatKoreanDate(cell.date)}
                  </span>
                  {cell.time_slot && (
                    <span className="text-[10px] block opacity-80 truncate">
                      [{cell.time_slot}]
                    </span>
                  )}
                  <div className="flex items-end justify-between mt-2">
                    <span className="text-sm font-black">
                      {cell.possible_count}/{totalVotersCount}명
                    </span>
                    <span className="text-[10px] font-extrabold opacity-75">
                      {Math.round(cell.ratio * 100)}%
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-end gap-3 text-[11px] text-slate-500 pt-1">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" /> 전원 가능
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-300 inline-block" /> 66% 이상
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-300 inline-block" /> 33% 이상
            </span>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedCell && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white border border-slate-200 rounded-3xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h4 className="text-sm font-extrabold text-slate-900">
                  {formatKoreanDate(selectedCell.date)}
                </h4>
                {selectedCell.time_slot && (
                  <p className="text-xs text-slate-700 font-bold">
                    [{selectedCell.time_slot}]
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => setSelectedCell(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Attendee List */}
            <div className="space-y-2 text-xs max-h-60 overflow-y-auto">
              <p className="font-bold text-slate-700">참석 가능 현황 ({selectedCell.attendees.length}명)</p>
              {selectedCell.attendees.map((att, idx) => {
                const isPossible = att.status === 'possible';
                const isMaybe = att.status === 'maybe';

                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 border border-slate-200/80"
                  >
                    <span className="font-bold text-slate-800">{att.nickname}</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1 ${
                        isPossible
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                          : isMaybe
                          ? 'bg-amber-100 text-amber-900 border border-amber-200'
                          : 'bg-rose-100 text-rose-900 border border-rose-200'
                      }`}
                    >
                      {isPossible && <UserCheck className="w-3 h-3" />}
                      {isMaybe && <HelpCircle className="w-3 h-3" />}
                      {!isPossible && !isMaybe && <UserX className="w-3 h-3" />}
                      {isPossible ? '가능' : isMaybe ? '미정' : '불가'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
