'use client';

import React, { useState } from 'react';
import { Users, CheckCircle2, HelpCircle, XCircle, UserX, Info, MessageSquare } from 'lucide-react';
import { HeatmapCellData, Room } from '@/types/schema';
import { formatKoreanDate } from '@/lib/analytics';

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

  const getHeatmapClass = (cell: HeatmapCellData) => {
    if (cell.possible_count === totalVotersCount && totalVotersCount > 0) {
      return 'heatmap-cell-gold animate-pulse';
    }
    if (cell.ratio >= 0.75) return 'heatmap-cell-high';
    if (cell.ratio >= 0.4) return 'heatmap-cell-medium';
    if (cell.ratio > 0) return 'heatmap-cell-low';
    return 'heatmap-cell-0';
  };

  return (
    <div className="w-full glass-card rounded-2xl p-5 border border-purple-500/20 my-6 space-y-4">
      {/* Header & Legend */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-purple-500/10">
        <div>
          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-400" />
            <span>투표 현황 컬러 히트맵</span>
          </h3>
          <p className="text-xs text-purple-300/80 mt-0.5">
            참여인원 <span className="font-bold text-white">{totalVotersCount}명</span> 기준 (셀을 클릭하면 세부 명단을 볼 수 있습니다)
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-purple-300">
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-amber-400 border border-amber-300 inline-block" />
            <span>100%</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-purple-500 inline-block" />
            <span>높음</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-purple-800 inline-block" />
            <span>낮음</span>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {Object.values(heatmapMap).map((cell) => {
          const isGold = cell.possible_count === totalVotersCount && totalVotersCount > 0;
          return (
            <button
              key={cell.key}
              type="button"
              onClick={() => setSelectedCell(cell)}
              className={`p-3.5 rounded-xl border transition-all text-left flex flex-col justify-between h-28 ${getHeatmapClass(
                cell
              )} hover:scale-[1.03] active:scale-95 cursor-pointer shadow-md`}
            >
              <div>
                <span className="text-xs font-black block">
                  {formatKoreanDate(cell.date)}
                </span>
                {cell.time_slot && (
                  <span className="text-[11px] font-bold block opacity-90">
                    [{cell.time_slot}]
                  </span>
                )}
              </div>

              <div className="flex items-end justify-between mt-2">
                <div>
                  <span className="text-xl font-black">{cell.possible_count}</span>
                  <span className="text-xs font-semibold opacity-80">/{totalVotersCount}명</span>
                </div>

                {isGold ? (
                  <span className="text-[10px] bg-black/60 text-amber-300 font-extrabold px-2 py-0.5 rounded-full border border-amber-300/40">
                    PERFECT!
                  </span>
                ) : (
                  <span className="text-[10px] font-bold opacity-75">
                    {Math.round(cell.ratio * 100)}%
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Attendee / Absentee Detail Modal */}
      {selectedCell && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card rounded-2xl p-6 max-w-md w-full border border-purple-500/30 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
              <div>
                <h4 className="text-base font-extrabold text-white">
                  {formatKoreanDate(selectedCell.date)} {selectedCell.time_slot ? `[${selectedCell.time_slot}]` : ''}
                </h4>
                <p className="text-xs text-purple-300">
                  총 {totalVotersCount}명 중 <span className="text-emerald-400 font-bold">{selectedCell.possible_count}명 가능</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCell(null)}
                className="text-purple-300 hover:text-white text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Attendance breakdown lists */}
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {/* Possible */}
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 mb-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>참석 가능 ({selectedCell.attendees.filter((a) => a.status === 'possible').length}명)</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCell.attendees
                    .filter((a) => a.status === 'possible')
                    .map((a, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/20 text-emerald-200 border border-emerald-500/30"
                      >
                        {a.nickname}
                      </span>
                    ))}
                  {selectedCell.attendees.filter((a) => a.status === 'possible').length === 0 && (
                    <span className="text-xs text-gray-500 italic">없음</span>
                  )}
                </div>
              </div>

              {/* Maybe */}
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 mb-1.5">
                  <HelpCircle className="w-4 h-4" />
                  <span>조율/세모 ({selectedCell.attendees.filter((a) => a.status === 'maybe').length}명)</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCell.attendees
                    .filter((a) => a.status === 'maybe')
                    .map((a, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500/20 text-amber-200 border border-amber-500/30"
                      >
                        {a.nickname}
                      </span>
                    ))}
                  {selectedCell.attendees.filter((a) => a.status === 'maybe').length === 0 && (
                    <span className="text-xs text-gray-500 italic">없음</span>
                  )}
                </div>
              </div>

              {/* Impossible with reason notes */}
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400 mb-1.5">
                  <XCircle className="w-4 h-4" />
                  <span>불가능 ({selectedCell.attendees.filter((a) => a.status === 'impossible').length}명)</span>
                </div>
                <div className="space-y-1.5">
                  {selectedCell.attendees
                    .filter((a) => a.status === 'impossible')
                    .map((a, i) => (
                      <div
                        key={i}
                        className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs flex items-center justify-between"
                      >
                        <span className="font-semibold text-rose-200">{a.nickname}</span>
                        {a.note && (
                          <span className="text-rose-300/80 text-[11px] flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            <span>{a.note}</span>
                          </span>
                        )}
                      </div>
                    ))}
                  {selectedCell.attendees.filter((a) => a.status === 'impossible').length === 0 && (
                    <span className="text-xs text-gray-500 italic block">없음</span>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedCell(null)}
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
