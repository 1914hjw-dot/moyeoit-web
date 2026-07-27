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
  // Dynamically initialize to current year & month
  const [currentMonthDate, setCurrentMonthDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

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
    <div className="w-full sys-card p-4 sm:p-6 space-y-5 bg-white border-slate-200/80 shadow-sm">
      {/* Schedule Mode Segment Control */}
      <div>
        <label id="schedule-mode-label" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
          조율 방식
        </label>
        <div role="group" aria-labelledby="schedule-mode-label" className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-slate-100/80 border border-slate-200/60">
          <button
            type="button"
            aria-pressed={scheduleType === 'date_only'}
            onClick={() => onChangeScheduleType('date_only')}
            className={`h-11 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              scheduleType === 'date_only'
                ? 'bg-white text-indigo-600 shadow-md shadow-indigo-500/5'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <CalendarIcon className="w-4 h-4" />
            <span>날짜만 조율</span>
          </button>

          <button
            type="button"
            aria-pressed={scheduleType === 'date_time'}
            onClick={() => {
              onChangeScheduleType('date_time');
              if (timeSlots.length === 0) onChangeTimeSlots(DEFAULT_TIME_SLOTS);
            }}
            className={`h-11 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              scheduleType === 'date_time'
                ? 'bg-white text-indigo-600 shadow-md shadow-indigo-500/5'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>날짜 + 시간대</span>
          </button>
        </div>
      </div>

      {/* Time Slots toggle if date_time */}
      {scheduleType === 'date_time' && (
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
          <span className="text-xs font-bold text-slate-700 block">시간대 선택:</span>
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
                  className={`h-10 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                      : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300'
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

      {/* Quick Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
        <button
          type="button"
          aria-label="이번 달 주말 전체 선택"
          onClick={selectAllWeekends}
          className="h-10 px-3.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
        >
          <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <span>이번 달 주말 전체 선택</span>
        </button>

        {selectedDates.length > 0 && (
          <button
            type="button"
            aria-label="선택된 모든 날짜 초기화"
            onClick={clearAllDates}
            className="h-10 px-3 rounded-xl text-xs font-semibold text-slate-400 hover:text-rose-500 transition-all flex items-center gap-1 cursor-pointer"
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
          className="w-10 h-10 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all flex items-center justify-center cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight" aria-live="polite">
          {year}년 {month + 1}월
        </span>
        <button
          type="button"
          aria-label="다음 달 보기"
          onClick={handleNextMonth}
          className="w-10 h-10 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all flex items-center justify-center cursor-pointer"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1.5 text-center" role="grid" aria-label={`${year}년 ${month + 1}월 달력`}>
        {['일', '월', '화', '수', '목', '금', '토'].map((day, idx) => (
          <div
            key={day}
            role="columnheader"
            className={`text-xs font-bold py-1 ${
              idx === 0 ? 'text-rose-500' : idx === 6 ? 'text-indigo-600' : 'text-slate-400'
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
              className={`h-11 sm:h-12 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center relative cursor-pointer active:scale-95 touch-manipulation ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : isWeekend
                  ? 'bg-slate-100/90 text-slate-800 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200/60'
                  : 'bg-slate-50 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-100'
              }`}
            >
              <span>{dayNum}</span>
              {isSelected && (
                <span className="w-1.5 h-1.5 rounded-full bg-white absolute bottom-1.5" />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected dates count */}
      <div className="pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100" aria-live="polite">
        <span>선택된 후보 날짜</span>
        <span className="font-extrabold text-indigo-600">{selectedDates.length}개 일자 선택됨</span>
      </div>
    </div>
  );
};
