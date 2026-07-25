'use client';

import React, { useState } from 'react';
import { Users, CheckCircle2, HelpCircle, XCircle, MessageSquare } from 'lucide-react';
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
      return 'heatmap-cell-gold';
    }
    if (cell.ratio >= 0.75) return 'heatmap-cell-high';
    if (cell.ratio >= 0.4) return 'heatmap-cell-medium';
    if (cell.ratio > 0) return 'heatmap-cell-low';
    return 'heatmap-cell-0';
  };

  return (
    <div className="w-full linear-card p-5 space-y-4 my-6">
      {/* Header & Legend */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
        <div>
          <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            <span>투표 현황 히트맵</span>
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            참여인원 <strong className="text-zinc-100">{totalVotersCount}명</strong> 기준 (셀 클릭 시 세부 명단 표시)
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 text-[11px] font-medium text-zinc-400">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-amber-400 inline-block" />
            <span>100%</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block" />
            <span>높음</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-zinc-800 inline-block" />
            <span>낮음</span>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
        {Object.values(heatmapMap).map((cell) => {
          const isGold = cell.possible_count === totalVotersCount && totalVotersCount > 0;
          return (
            <button
              key={cell.key}
              type="button"
              onClick={() => setSelectedCell(cell)}
              className={`p-3.5 rounded-xl transition-all text-left flex flex-col justify-between h-24 cursor-pointer ${getHeatmapClass(
                cell
              )} hover:scale-[1.02] active:scale-95`}
            >
              <div>
                <span className="text-xs font-bold block">
                  {formatKoreanDate(cell.date)}
                </span>
                {cell.time_slot && (
                  <span className="text-[11px] opacity-90 block">
                    [{cell.time_slot}]
                  </span>
                )}
              </div>

              <div className="flex items-end justify-between mt-2">
                <div>
                  <span className="text-lg font-black">{cell.possible_count}</span>
                  <span className="text-xs opacity-75">/{totalVotersCount}명</span>
                </div>

                {isGold ? (
                  <span className="text-[10px] bg-zinc-950 text-amber-300 font-extrabold px-1.5 py-0.5 rounded">
                    PERFECT
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold opacity-80">
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="linear-card p-6 max-w-md w-full border-zinc-700 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div>
                <h4 className="text-sm font-bold text-zinc-100">
                  {formatKoreanDate(selectedCell.date)} {selectedCell.time_slot ? `[${selectedCell.time_slot}]` : ''}
                </h4>
                <p className="text-xs text-zinc-400 mt-0.5">
                  총 {totalVotersCount}명 중 <span className="text-emerald-400 font-bold">{selectedCell.possible_count}명 가능</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCell(null)}
                className="text-zinc-400 hover:text-zinc-100 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Attendance breakdown lists */}
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {/* Possible */}
              <div>
                <div className="flex items-center gap-1 text-xs font-bold text-emerald-400 mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>참석 가능 ({selectedCell.attendees.filter((a) => a.status === 'possible').length}명)</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCell.attendees
                    .filter((a) => a.status === 'possible')
                    .map((a, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                      >
                        {a.nickname}
                      </span>
                    ))}
                  {selectedCell.attendees.filter((a) => a.status === 'possible').length === 0 && (
                    <span className="text-xs text-zinc-600 italic">없음</span>
                  )}
                </div>
              </div>

              {/* Maybe */}
              <div>
                <div className="flex items-center gap-1 text-xs font-bold text-amber-400 mb-1">
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>조율/세모 ({selectedCell.attendees.filter((a) => a.status === 'maybe').length}명)</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCell.attendees
                    .filter((a) => a.status === 'maybe')
                    .map((a, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20"
                      >
                        {a.nickname}
                      </span>
                    ))}
                  {selectedCell.attendees.filter((a) => a.status === 'maybe').length === 0 && (
                    <span className="text-xs text-zinc-600 italic">없음</span>
                  )}
                </div>
              </div>

              {/* Impossible */}
              <div>
                <div className="flex items-center gap-1 text-xs font-bold text-rose-400 mb-1">
                  <XCircle className="w-3.5 h-3.5" />
                  <span>불가능 ({selectedCell.attendees.filter((a) => a.status === 'impossible').length}명)</span>
                </div>
                <div className="space-y-1">
                  {selectedCell.attendees
                    .filter((a) => a.status === 'impossible')
                    .map((a, i) => (
                      <div
                        key={i}
                        className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs flex items-center justify-between"
                      >
                        <span className="font-semibold text-rose-300">{a.nickname}</span>
                        {a.note && (
                          <span className="text-zinc-400 text-[11px] flex items-center gap-1">
                            <MessageSquare className="w-3 h-3 text-zinc-500" />
                            <span>{a.note}</span>
                          </span>
                        )}
                      </div>
                    ))}
                  {selectedCell.attendees.filter((a) => a.status === 'impossible').length === 0 && (
                    <span className="text-xs text-zinc-600 italic block">없음</span>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedCell(null)}
              className="w-full v-btn-secondary py-2 text-xs font-bold"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
