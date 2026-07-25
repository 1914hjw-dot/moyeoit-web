'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Zap, Check, Trash2, Clock } from 'lucide-react';
import { ScheduleType } from '@/types/schema';

interface CalendarSelectorProps {
  selectedDates: string[];
  onChangeSelectedDates: (dates: string[]) => void;
  scheduleType: ScheduleType;
  onChangeScheduleType: (type: ScheduleType) => void;
  timeSlots: string[];
  onChangeTimeSlots: (slots: string[]) => void;
}

export const CalendarSelector: React.FC<CalendarSelectorProps> = ({
  selectedDates,
  onChangeSelectedDates,
  scheduleType,
  onChangeScheduleType,
  timeSlots,
  onChangeTimeSlots,
}) => {
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date(2026, 6, 1)); // 2026 July

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => setCurrentMonthDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentMonthDate(new Date(year, month + 1, 1));

  const formatDateStr = (d: number) => {
    const mStr = String(month + 1).padStart(2, '0');
    const dStr = String(d).padStart(2, '0');
    return `${year}-${mStr}-${dStr}`;
  };

  const toggleDate = (dateStr: string) => {
    if (selectedDates.includes(dateStr)) {
      onChangeSelectedDates(selectedDates.filter((d) => d !== dateStr));
    } else {
      onChangeSelectedDates([...selectedDates, dateStr].sort());
    }
  };

  const selectAllWeekends = () => {
    const weekendDates: string[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const dayOfWeek = new Date(year, month, d).getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        weekendDates.push(formatDateStr(d));
      }
    }
    const combined = Array.from(new Set([...selectedDates, ...weekendDates])).sort();
    onChangeSelectedDates(combined);
  };

  const clearAllDates = () => onChangeSelectedDates([]);

  const DEFAULT_TIME_SLOTS = ['오전 (10:00~14:00)', '오후 (14:00~18:00)', '저녁 (18:00~22:00)'];

  const toggleTimeSlot = (slot: string) => {
    if (timeSlots.includes(slot)) {
      onChangeTimeSlots(timeSlots.filter((s) => s !== slot));
    } else {
      onChangeTimeSlots([...timeSlots, slot]);
    }
  };

  return (
    <div className="w-full sys-card p-4 sm:p-6 space-y-5">
      {/* Schedule Mode Segment Control */}
      <div>
        <label id="schedule-mode-label" className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">
          조율 방식
        </label>
        <div role="group" aria-labelledby="schedule-mode-label" className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-zinc-900/90 border border-zinc-800">
          <button
            type="button"
            aria-pressed={scheduleType === 'date_only'}
            onClick={() => onChangeScheduleType('date_only')}
            className={`h-11 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              scheduleType === 'date_only'
                ? 'bg-zinc-100 text-zinc-950 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>날짜만 조율</span>
          </button>

          <button
            type="button"
            aria-pressed={scheduleType === 'date_time'}
            onClick={() => {
              onChangeScheduleType('date_time');
              if (timeSlots.length === 0) onChangeTimeSlots(DEFAULT_TIME_SLOTS);
            }}
            className={`h-11 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              scheduleType === 'date_time'
                ? 'bg-zinc-100 text-zinc-950 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>날짜 + 시간대</span>
          </button>
        </div>
      </div>

      {/* Time Slots toggle if date_time */}
      {scheduleType === 'date_time' && (
        <div className="p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-800/80 space-y-2">
          <span className="text-xs font-semibold text-zinc-300 block">시간대 포함:</span>
          <div className="flex flex-wrap gap-2">
            {DEFAULT_TIME_SLOTS.map((slot) => {
              const isSelected = timeSlots.includes(slot);
              return (
                <button
                  key={slot}
                  type="button"
                  aria-pressed={isSelected}
                  aria-label={`${slot} 시간대 선택`}
                  onClick={() => toggleTimeSlot(slot)}
                  className={`h-10 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white border border-indigo-500'
                      : 'bg-zinc-800/50 text-zinc-400 border border-zinc-700/50 hover:text-zinc-200'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                  <span>{slot}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Action Bar (1-second weekend auto select) */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-800/60">
        <button
          type="button"
          aria-label="이번 달 주말 전체 1초에 선택하기"
          onClick={selectAllWeekends}
          className="h-10 px-3.5 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20 hover:bg-amber-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span>이번 달 주말 전체 선택</span>
        </button>

        {selectedDates.length > 0 && (
          <button
            type="button"
            aria-label="선택된 모든 날짜 초기화"
            onClick={clearAllDates}
            className="h-10 px-3 rounded-xl text-xs text-zinc-400 hover:text-rose-400 transition-all flex items-center gap-1 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>초기화 ({selectedDates.length})</span>
          </button>
        )}
      </div>

      {/* Calendar Header */}
      <div className="flex items-center justify-between px-1">
        <button
          type="button"
          aria-label="이전 달 보기"
          onClick={handlePrevMonth}
          className="w-10 h-10 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80 transition-all flex items-center justify-center cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-sm font-extrabold text-zinc-100 tracking-tight" aria-live="polite">
          {year}년 {month + 1}월
        </span>
        <button
          type="button"
          aria-label="다음 달 보기"
          onClick={handleNextMonth}
          className="w-10 h-10 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80 transition-all flex items-center justify-center cursor-pointer"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5 text-center" role="grid" aria-label={`${year}년 ${month + 1}월 달력`}>
        {['일', '월', '화', '수', '목', '금', '토'].map((day, idx) => (
          <div
            key={day}
            role="columnheader"
            className={`text-xs font-bold py-1 ${
              idx === 0 ? 'text-rose-400' : idx === 6 ? 'text-indigo-400' : 'text-zinc-500'
            }`}
          >
            {day}
          </div>
        ))}

        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="h-11 sm:h-12" />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dayNum = i + 1;
          const dateStr = formatDateStr(dayNum);
          const isSelected = selectedDates.includes(dateStr);
          const dayOfWeek = new Date(year, month, dayNum).getDay();
          const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

          return (
            <button
              key={dateStr}
              type="button"
              role="gridcell"
              aria-selected={isSelected}
              aria-label={`${year}년 ${month + 1}월 ${dayNum}일 ${isSelected ? '선택됨' : '선택 안 됨'}`}
              onClick={() => toggleDate(dateStr)}
              className={`h-11 sm:h-12 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center relative cursor-pointer active:scale-95 touch-manipulation ${
                isSelected
                  ? 'bg-zinc-100 text-zinc-950 font-extrabold shadow-md'
                  : isWeekend
                  ? 'bg-zinc-900/80 text-zinc-200 hover:bg-zinc-800/90 border border-zinc-800/60'
                  : 'bg-zinc-900/30 text-zinc-300 hover:bg-zinc-800/50 border border-transparent'
              }`}
            >
              <span>{dayNum}</span>
              {isSelected && (
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 absolute bottom-1" />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected dates count */}
      <div className="pt-2 flex items-center justify-between text-xs text-zinc-400 border-t border-zinc-800/60" aria-live="polite">
        <span>선택된 후보 날짜</span>
        <span className="font-bold text-zinc-100">{selectedDates.length}개 일자 선택됨</span>
      </div>
    </div>
  );
};
