'use client';

import React, { useState } from 'react';
import { AvailabilityStatus, HeatmapCellData } from '@/types/schema';
import { formatKoreanDate } from '@/lib/analytics';
import { ChevronLeft, ChevronRight, Check, HelpCircle, X, CheckCheck, Sparkles, Calendar as CalendarIcon } from 'lucide-react';

interface CalendarVoteSelectorProps {
  candidateDates: string[]; // ['2026-08-01', '2026-08-02', ...]
  availability: Record<string, AvailabilityStatus>;
  onChangeAvailability: (newAvailability: Record<string, AvailabilityStatus>) => void;
  timeSlots?: string[];
  scheduleType?: 'date_only' | 'date_time';
  heatmapData?: Record<string, HeatmapCellData>;
  readOnly?: boolean;
}

const WEEKDAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

export const CalendarVoteSelector: React.FC<CalendarVoteSelectorProps> = ({
  candidateDates,
  availability,
  onChangeAvailability,
  timeSlots = [],
  scheduleType = 'date_only',
  heatmapData = {},
  readOnly = false,
}) => {
  if (!candidateDates || candidateDates.length === 0) {
    return (
      <div className="p-4 text-center text-xs text-zinc-500 bg-zinc-950 rounded-2xl border border-zinc-800">
        등록된 후보 날짜가 없습니다.
      </div>
    );
  }

  // Extract unique months from candidate dates (sorted)
  const candidateMonths: { year: number; month: number; key: string }[] = [];
  const candidateSet = new Set(candidateDates);

  for (const dateStr of candidateDates) {
    const [y, m] = dateStr.split('-').map(Number);
    const key = `${y}-${m}`;
    if (!candidateMonths.some((cm) => cm.key === key)) {
      candidateMonths.push({ year: y, month: m, key });
    }
  }

  candidateMonths.sort((a, b) => (a.year !== b.year ? a.year - b.year : a.month - b.month));

  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);
  const activeMonth = candidateMonths[currentMonthIndex] || candidateMonths[0];

  // Build 42-cell grid for active month
  const year = activeMonth.year;
  const monthIndex = activeMonth.month - 1; // 0-indexed for JS Date
  const firstDayOfWeek = new Date(year, monthIndex, 1).getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  const calendarDays: { dateStr: string; dayNum: number; isCurrentMonth: boolean; isCandidate: boolean }[] = [];

  // Previous month trailing days
  const prevMonthDays = new Date(year, monthIndex, 0).getDate();
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const dayNum = prevMonthDays - i;
    const pDate = new Date(year, monthIndex - 1, dayNum);
    const pStr = pDate.toISOString().split('T')[0];
    calendarDays.push({
      dateStr: pStr,
      dayNum,
      isCurrentMonth: false,
      isCandidate: false,
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const mStr = (monthIndex + 1).toString().padStart(2, '0');
    const dStr = d.toString().padStart(2, '0');
    const dateStr = `${year}-${mStr}-${dStr}`;
    calendarDays.push({
      dateStr,
      dayNum: d,
      isCurrentMonth: true,
      isCandidate: candidateSet.has(dateStr),
    });
  }

  // Next month leading days to complete week rows
  const remainingCells = 7 - (calendarDays.length % 7);
  if (remainingCells < 7) {
    for (let d = 1; d <= remainingCells; d++) {
      const nDate = new Date(year, monthIndex + 1, d);
      const nStr = nDate.toISOString().split('T')[0];
      calendarDays.push({
        dateStr: nStr,
        dayNum: d,
        isCurrentMonth: false,
        isCandidate: false,
      });
    }
  }

  // Batch Toggle Actions
  const handleSetAll = (status: AvailabilityStatus) => {
    if (readOnly) return;
    const updated = { ...availability };
    for (const d of candidateDates) {
      if (scheduleType === 'date_time' && timeSlots.length > 0) {
        for (const slot of timeSlots) {
          updated[`${d}_${slot}`] = status;
        }
      } else {
        updated[d] = status;
      }
    }
    onChangeAvailability(updated);
  };

  // Toggle single date status: possible -> impossible -> maybe -> possible
  const handleToggleStatus = (key: string) => {
    if (readOnly) return;
    const current = availability[key] || 'possible';
    let next: AvailabilityStatus = 'impossible';
    if (current === 'possible') next = 'impossible';
    else if (current === 'impossible') next = 'maybe';
    else if (current === 'maybe') next = 'possible';

    onChangeAvailability({
      ...availability,
      [key]: next,
    });
  };

  return (
    <div className="w-full sys-card p-4 sm:p-5 space-y-4 border-zinc-800 shadow-xl bg-zinc-950/90">
      {/* Calendar Header & Month Navigation */}
      <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-amber-400" />
          <h4 className="text-sm font-extrabold text-zinc-100">
            {activeMonth.year}년 {activeMonth.month}월
          </h4>
          <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
            후보 날짜 {candidateDates.length}개
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Quick Month Switchers */}
          <button
            type="button"
            disabled={currentMonthIndex === 0}
            onClick={() => setCurrentMonthIndex((prev) => Math.max(0, prev - 1))}
            className="p-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 disabled:opacity-30 hover:bg-zinc-800 cursor-pointer"
            aria-label="이전 달"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-zinc-400 px-1">
            {currentMonthIndex + 1} / {candidateMonths.length}
          </span>
          <button
            type="button"
            disabled={currentMonthIndex === candidateMonths.length - 1}
            onClick={() => setCurrentMonthIndex((prev) => Math.min(candidateMonths.length - 1, prev + 1))}
            className="p-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 disabled:opacity-30 hover:bg-zinc-800 cursor-pointer"
            aria-label="다음 달"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Batch Control Buttons (If interactive voting) */}
      {!readOnly && (
        <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs">
          <span className="text-[11px] font-bold text-zinc-400">
            후보 날짜는 기본 <strong className="text-emerald-400">'가능'</strong> 처리되어 있습니다:
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => handleSetAll('possible')}
              className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 hover:bg-emerald-500/20 cursor-pointer flex items-center gap-1"
            >
              <CheckCheck className="w-3 h-3" />
              <span>전체 가능</span>
            </button>
            <button
              type="button"
              onClick={() => handleSetAll('impossible')}
              className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-rose-500/10 text-rose-300 border border-rose-500/20 hover:bg-rose-500/20 cursor-pointer flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              <span>전체 불가</span>
            </button>
          </div>
        </div>
      )}

      {/* Weekday Labels Grid */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-zinc-500 py-1">
        {WEEKDAY_NAMES.map((name, i) => (
          <div key={name} className={i === 0 ? 'text-rose-400' : i === 6 ? 'text-indigo-400' : ''}>
            {name}
          </div>
        ))}
      </div>

      {/* 42-Cell Month Grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {calendarDays.map((cell, idx) => {
          if (!cell.isCurrentMonth) {
            return (
              <div
                key={idx}
                className="h-14 rounded-xl border border-transparent p-1 text-[11px] text-zinc-700 select-none opacity-20 pointer-events-none"
              >
                {cell.dayNum}
              </div>
            );
          }

          if (!cell.isCandidate) {
            return (
              <div
                key={idx}
                className="h-14 rounded-xl border border-zinc-900 bg-zinc-950/40 p-1 text-zinc-600 flex flex-col justify-between select-none opacity-40"
              >
                <span className="text-[11px] font-medium">{cell.dayNum}</span>
              </div>
            );
          }

          // Candidate Date Cell
          const key = cell.dateStr;
          const status = availability[key] || 'possible';
          const heatmap = heatmapData[key];

          const isPossible = status === 'possible';
          const isMaybe = status === 'maybe';
          const isImpossible = status === 'impossible';

          return (
            <button
              key={idx}
              type="button"
              disabled={readOnly}
              onClick={() => handleToggleStatus(key)}
              className={`h-16 sm:h-18 rounded-xl p-1.5 flex flex-col justify-between transition-all text-left cursor-pointer border shadow-sm ${
                isPossible
                  ? 'bg-emerald-950/40 border-emerald-500/80 text-emerald-100 hover:bg-emerald-900/50'
                  : isMaybe
                  ? 'bg-amber-950/40 border-amber-500/80 text-amber-100 hover:bg-amber-900/50'
                  : 'bg-rose-950/40 border-rose-500/80 text-rose-100 hover:bg-rose-900/50'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-black">{cell.dayNum}</span>
                <span
                  className={`text-[9px] font-bold px-1 rounded flex items-center gap-0.5 ${
                    isPossible
                      ? 'bg-emerald-500 text-zinc-950'
                      : isMaybe
                      ? 'bg-amber-400 text-zinc-950'
                      : 'bg-rose-500 text-white'
                  }`}
                >
                  {isPossible && <Check className="w-2.5 h-2.5" />}
                  {isMaybe && <HelpCircle className="w-2.5 h-2.5" />}
                  {isImpossible && <X className="w-2.5 h-2.5" />}
                  <span>{isPossible ? '가능' : isMaybe ? '세모' : '불가'}</span>
                </span>
              </div>

              {/* Attendance Count & Names Summary Preview */}
              {heatmap && heatmap.total_votes > 0 ? (
                <div className="w-full">
                  <div className="text-[10px] font-bold text-zinc-300 flex items-center justify-between">
                    <span className="text-emerald-400">{heatmap.possible_count}명 가능</span>
                    <span className="text-[9px] text-zinc-500">{Math.round(heatmap.ratio * 100)}%</span>
                  </div>
                </div>
              ) : (
                <span className="text-[9px] text-zinc-400 font-semibold block truncate">
                  후보일
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend Footer */}
      <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1 border-t border-zinc-800/80">
        <span className="text-zinc-500">후보 날짜 터치 시 상태 변경</span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-emerald-400 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> 가능
          </span>
          <span className="flex items-center gap-1 text-amber-400 font-bold">
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> 세모
          </span>
          <span className="flex items-center gap-1 text-rose-400 font-bold">
            <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" /> 불가
          </span>
        </div>
      </div>
    </div>
  );
};
