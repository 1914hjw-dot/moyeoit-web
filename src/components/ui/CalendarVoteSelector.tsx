'use client';

import React, { useState } from 'react';
import { AvailabilityStatus, HeatmapCellData } from '@/types/schema';
import { ChevronLeft, ChevronRight, CheckCheck, X, Calendar as CalendarIcon, Sparkles, Clock, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { formatKoreanDate } from '@/lib/analytics';

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
  const [activeDateTimeModalDate, setActiveDateTimeModalDate] = useState<string | null>(null);

  const isDateTimeMode = scheduleType === 'date_time' && timeSlots.length > 0;

  if (!candidateDates || candidateDates.length === 0) {
    return (
      <div className="p-5 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl border border-slate-200">
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

  const year = activeMonth.year;
  const monthIndex = activeMonth.month - 1; // 0-indexed for JS Date
  const firstDayOfWeek = new Date(year, monthIndex, 1).getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  const calendarDays: { dateStr: string; dayNum: number; isCurrentMonth: boolean; isCandidate: boolean }[] = [];

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
      if (isDateTimeMode) {
        for (const slot of timeSlots) {
          updated[`${d}_${slot}`] = status;
        }
      } else {
        updated[d] = status;
      }
    }
    onChangeAvailability(updated);
    setFeedbackMsg(status === 'possible' ? '모든 시간대가 [가능]으로 설정되었습니다!' : '모든 시간대가 [불가]로 설정되었습니다!');
    setTimeout(() => setFeedbackMsg(''), 2500);
  };

  // Toggle status for single key (date or date_slot)
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

  // Check overall date status for date_time mode summary badge
  const getDateStatusSummary = (dateStr: string) => {
    if (!isDateTimeMode) return availability[dateStr] || 'possible';

    const statuses = timeSlots.map((slot) => availability[`${dateStr}_${slot}`] || 'possible');
    const allPossible = statuses.every((s) => s === 'possible');
    const allImpossible = statuses.every((s) => s === 'impossible');
    if (allPossible) return 'possible';
    if (allImpossible) return 'impossible';
    return 'maybe';
  };

  return (
    <div className="w-full sys-card p-4 sm:p-5 space-y-4 border-slate-200/80 shadow-md bg-white rounded-3xl">
      {/* Calendar Header & Month Navigation */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200">
            <CalendarIcon className="w-4 h-4" />
          </div>
          <h4 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
            {activeMonth.year}년 {activeMonth.month}월
          </h4>
          <span className="text-[10px] font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full">
            {isDateTimeMode ? '날짜 + 시간대 조율' : `후보 ${candidateDates.length}일`}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={currentMonthIndex === 0}
            onClick={() => setCurrentMonthIndex((prev) => Math.max(0, prev - 1))}
            className="p-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 disabled:opacity-30 hover:bg-slate-100 transition-all cursor-pointer"
            aria-label="이전 달"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-slate-400 px-1">
            {currentMonthIndex + 1} / {candidateMonths.length}
          </span>
          <button
            type="button"
            disabled={currentMonthIndex === candidateMonths.length - 1}
            onClick={() => setCurrentMonthIndex((prev) => Math.min(candidateMonths.length - 1, prev + 1))}
            className="p-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 disabled:opacity-30 hover:bg-slate-100 transition-all cursor-pointer"
            aria-label="다음 달"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Batch Control & Tip Bar */}
      {!readOnly && (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2 p-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
            <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-slate-700" />
              <span>{isDateTimeMode ? '날짜 클릭 후 가능 시간대를 선택하세요' : '안 되는 날짜만 눌러서 해제하세요'}</span>
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => handleSetAll('possible')}
                className="px-2.5 py-1 rounded-xl text-[11px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 cursor-pointer transition-all flex items-center gap-1 shadow-xs"
              >
                <CheckCheck className="w-3 h-3" />
                <span>전체 가능</span>
              </button>
              <button
                type="button"
                onClick={() => handleSetAll('impossible')}
                className="px-2.5 py-1 rounded-xl text-[11px] font-extrabold bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100 cursor-pointer transition-all flex items-center gap-1 shadow-xs"
              >
                <X className="w-3 h-3" />
                <span>전체 불가</span>
              </button>
            </div>
          </div>

          {feedbackMsg && (
            <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold text-center animate-in fade-in">
              {feedbackMsg}
            </div>
          )}
        </div>
      )}

      {/* Weekday Labels Grid */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-400 py-1">
        {WEEKDAY_NAMES.map((name, i) => (
          <div key={name} className={i === 0 ? 'text-rose-500' : i === 6 ? 'text-slate-600' : ''}>
            {name}
          </div>
        ))}
      </div>

      {/* 42-Cell Month Grid */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {calendarDays.map((cell, idx) => {
          if (!cell.isCurrentMonth) {
            return (
              <div
                key={idx}
                className="h-12 sm:h-14 rounded-2xl border border-transparent p-1 text-[11px] text-slate-300 select-none opacity-20 pointer-events-none"
              >
                {cell.dayNum}
              </div>
            );
          }

          if (!cell.isCandidate) {
            return (
              <div
                key={idx}
                className="h-12 sm:h-14 rounded-2xl border border-slate-100 bg-slate-50/50 p-1 text-slate-400 flex flex-col justify-between select-none opacity-40"
              >
                <span className="text-[11px] font-medium pl-1">{cell.dayNum}</span>
              </div>
            );
          }

          // Candidate Date Cell
          const key = cell.dateStr;
          const status = getDateStatusSummary(key);

          const isPossible = status === 'possible';
          const isMaybe = status === 'maybe';

          return (
            <button
              key={idx}
              type="button"
              disabled={readOnly}
              aria-pressed={isPossible}
              onClick={() => {
                if (isDateTimeMode) {
                  setActiveDateTimeModalDate(key);
                } else {
                  handleToggleStatus(key);
                }
              }}
              className={`h-13 sm:h-15 rounded-2xl p-1.5 sm:p-2 flex flex-col justify-between transition-all text-left cursor-pointer border shadow-xs active:scale-95 ${
                isPossible
                  ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950 hover:bg-emerald-100 ring-1 ring-emerald-400/30'
                  : isMaybe
                  ? 'bg-amber-50/90 border-amber-300 text-amber-950 hover:bg-amber-100 ring-1 ring-amber-400/30'
                  : 'bg-rose-50/90 border-rose-300 text-rose-950 hover:bg-rose-100 ring-1 ring-rose-400/30'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-xs sm:text-sm font-black">{cell.dayNum}</span>
                {isDateTimeMode && <Clock className="w-3 h-3 text-slate-500 opacity-70" />}
              </div>

              <div className="w-full">
                <span className="text-[9px] font-extrabold block truncate">
                  {isDateTimeMode
                    ? isPossible
                      ? '전체가능'
                      : isMaybe
                      ? '부분가능'
                      : '불가'
                    : isPossible
                    ? '가능'
                    : isMaybe
                    ? '미정'
                    : '불가'}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* DateTime Slot Selector Modal / Drawer */}
      {activeDateTimeModalDate && isDateTimeMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-white border border-slate-200 rounded-3xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-slate-100 text-slate-700">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">
                    {formatKoreanDate(activeDateTimeModalDate)}
                  </h4>
                  <p className="text-[11px] text-slate-500">참석 가능한 시간대를 눌러서 선택하세요</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveDateTimeModalDate(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Time Slots List per Date */}
            <div className="space-y-2.5">
              {timeSlots.map((slot) => {
                const slotKey = `${activeDateTimeModalDate}_${slot}`;
                const currentStatus = availability[slotKey] || 'possible';
                const isPoss = currentStatus === 'possible';
                const isMay = currentStatus === 'maybe';

                return (
                  <div
                    key={slot}
                    className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                      isPoss
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                        : isMay
                        ? 'bg-amber-50 border-amber-200 text-amber-950'
                        : 'bg-rose-50 border-rose-200 text-rose-950'
                    }`}
                  >
                    <span className="text-xs font-bold">{slot}</span>
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(slotKey)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black cursor-pointer transition-all flex items-center gap-1 ${
                        isPoss
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : isMay
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'bg-rose-600 text-white shadow-xs'
                      }`}
                    >
                      {isPoss && <Check className="w-3.5 h-3.5" />}
                      <span>{isPoss ? '가능' : isMay ? '미정' : '불가'}</span>
                    </button>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setActiveDateTimeModalDate(null)}
              className="w-full sys-btn-primary h-11 text-xs font-black mt-2"
            >
              선택 완료
            </button>
          </div>
        </div>
      )}

      {/* Legend Footer */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
        <span className="text-slate-400">
          {isDateTimeMode ? '날짜 터치 시 시간대별 가능 여부 설정' : '날짜 터치 시 [가능➔불가➔미정] 순서 변경'}
        </span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-emerald-700 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> 가능
          </span>
          <span className="flex items-center gap-1 text-amber-700 font-bold">
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> 미정
          </span>
          <span className="flex items-center gap-1 text-rose-700 font-bold">
            <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" /> 불가
          </span>
        </div>
      </div>
    </div>
  );
};
