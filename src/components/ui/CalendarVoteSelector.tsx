'use client';

import React, { useState } from 'react';
import { AvailabilityStatus, HeatmapCellData } from '@/types/schema';
import { ChevronLeft, ChevronRight, Check, HelpCircle, X, CheckCheck, Calendar as CalendarIcon, Sparkles } from 'lucide-react';

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
  const [feedbackMsg, setFeedbackMsg] = useState('');

  if (!candidateDates || candidateDates.length === 0) {
    return (
      <div className="p-5 text-center text-xs text-zinc-500 bg-zinc-950/80 rounded-2xl border border-zinc-800">
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
    setFeedbackMsg(status === 'possible' ? '모든 날짜가 [가능]으로 설정되었습니다!' : '모든 날짜가 [불가]로 설정되었습니다!');
    setTimeout(() => setFeedbackMsg(''), 2500);
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
    <div className="w-full sys-card p-4 sm:p-5 space-y-4 border-zinc-800/80 shadow-2xl bg-zinc-950/95 backdrop-blur-md rounded-3xl">
      {/* Calendar Header & Month Navigation */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800/60">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <CalendarIcon className="w-4 h-4" />
          </div>
          <h4 className="text-sm sm:text-base font-black text-zinc-100 tracking-tight">
            {activeMonth.year}년 {activeMonth.month}월
          </h4>
          <span className="text-[10px] font-bold text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
            후보 {candidateDates.length}일
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={currentMonthIndex === 0}
            onClick={() => setCurrentMonthIndex((prev) => Math.max(0, prev - 1))}
            className="p-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 disabled:opacity-30 hover:bg-zinc-800 transition-all cursor-pointer"
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
            className="p-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 disabled:opacity-30 hover:bg-zinc-800 transition-all cursor-pointer"
            aria-label="다음 달"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Batch Control & Tip Bar */}
      {!readOnly && (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2 p-2.5 rounded-2xl bg-zinc-900/90 border border-zinc-800/80 text-xs">
            <span className="text-[11px] font-semibold text-zinc-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>안 되는 날짜만 눌러서 해제하세요</span>
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => handleSetAll('possible')}
                className="px-2.5 py-1 rounded-xl text-[11px] font-extrabold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 hover:bg-emerald-500/20 cursor-pointer transition-all flex items-center gap-1"
              >
                <CheckCheck className="w-3 h-3" />
                <span>전체 가능</span>
              </button>
              <button
                type="button"
                onClick={() => handleSetAll('impossible')}
                className="px-2.5 py-1 rounded-xl text-[11px] font-extrabold bg-rose-500/10 text-rose-300 border border-rose-500/20 hover:bg-rose-500/20 cursor-pointer transition-all flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                <span>전체 불가</span>
              </button>
            </div>
          </div>

          {feedbackMsg && (
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] font-bold text-center animate-in fade-in">
              {feedbackMsg}
            </div>
          )}
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

      {/* 42-Cell Month Grid with Soft Glassmorphism */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {calendarDays.map((cell, idx) => {
          if (!cell.isCurrentMonth) {
            return (
              <div
                key={idx}
                className="h-14 rounded-2xl border border-transparent p-1 text-[11px] text-zinc-800 select-none opacity-20 pointer-events-none"
              >
                {cell.dayNum}
              </div>
            );
          }

          if (!cell.isCandidate) {
            return (
              <div
                key={idx}
                className="h-14 rounded-2xl border border-zinc-900/60 bg-zinc-950/30 p-1 text-zinc-600 flex flex-col justify-between select-none opacity-30"
              >
                <span className="text-[11px] font-medium pl-1">{cell.dayNum}</span>
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
              aria-pressed={isPossible}
              onClick={() => handleToggleStatus(key)}
              className={`h-16 sm:h-18 rounded-2xl p-1.5 sm:p-2 flex flex-col justify-between transition-all text-left cursor-pointer border shadow-sm active:scale-95 ${
                isPossible
                  ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-100 hover:bg-emerald-900/40 ring-1 ring-emerald-500/20'
                  : isMaybe
                  ? 'bg-amber-950/30 border-amber-500/50 text-amber-100 hover:bg-amber-900/40 ring-1 ring-amber-500/20'
                  : 'bg-rose-950/30 border-rose-500/50 text-rose-100 hover:bg-rose-900/40 ring-1 ring-rose-500/20'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-xs sm:text-sm font-black">{cell.dayNum}</span>
                <span
                  className={`text-[9px] font-black px-1.5 py-0.5 rounded-full flex items-center gap-0.5 ${
                    isPossible
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : isMaybe
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  }`}
                >
                  {isPossible && <Check className="w-2.5 h-2.5" />}
                  {isMaybe && <HelpCircle className="w-2.5 h-2.5" />}
                  {isImpossible && <X className="w-2.5 h-2.5" />}
                  <span>{isPossible ? '가능' : isMaybe ? '세모' : '불가'}</span>
                </span>
              </div>

              {/* Attendance Count Preview */}
              {heatmap && heatmap.total_votes > 0 ? (
                <div className="w-full">
                  <div className="text-[10px] font-extrabold text-zinc-300 flex items-center justify-between">
                    <span className="text-emerald-400">{heatmap.possible_count}명 가능</span>
                    <span className="text-[9px] text-zinc-500">{Math.round(heatmap.ratio * 100)}%</span>
                  </div>
                </div>
              ) : (
                <span className="text-[9px] text-zinc-500 font-medium block truncate">
                  후보일
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend Footer */}
      <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-2 border-t border-zinc-800/60">
        <span className="text-zinc-500">날짜 터치 시 [가능➔불가➔세모] 순서 변경</span>
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
