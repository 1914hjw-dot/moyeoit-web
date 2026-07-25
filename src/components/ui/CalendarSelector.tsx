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
  const month = currentMonthDate.getMonth(); // 0-indexed

  // Calculate days in month
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentMonthDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthDate(new Date(year, month + 1, 1));
  };

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

  // 1-second instant button: Select all weekends of current month
  const selectAllWeekends = () => {
    const weekendDates: string[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(year, month, d);
      const dayOfWeek = dateObj.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        // Sunday (0) or Saturday (6)
        weekendDates.push(formatDateStr(d));
      }
    }

    // Combine with already selected dates (unique)
    const combined = Array.from(new Set([...selectedDates, ...weekendDates])).sort();
    onChangeSelectedDates(combined);
  };

  const clearAllDates = () => {
    onChangeSelectedDates([]);
  };

  const DEFAULT_TIME_SLOTS = ['오전 (10:00 ~ 14:00)', '오후 (14:00 ~ 18:00)', '저녁 (18:00 ~ 22:00)'];

  const toggleTimeSlot = (slot: string) => {
    if (timeSlots.includes(slot)) {
      onChangeTimeSlots(timeSlots.filter((s) => s !== slot));
    } else {
      onChangeTimeSlots([...timeSlots, slot]);
    }
  };

  return (
    <div className="w-full glass-card rounded-2xl p-4 sm:p-6 border border-purple-500/20 space-y-6">
      {/* Schedule Mode Selector (Date Only vs Date + Time) */}
      <div>
        <label className="text-xs font-semibold text-purple-300 uppercase tracking-wider block mb-2">
          조율 방식 선택
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onChangeScheduleType('date_only')}
            className={`p-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all ${
              scheduleType === 'date_only'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30 border border-purple-400'
                : 'bg-purple-950/30 text-purple-300 hover:bg-purple-900/40 border border-purple-500/10'
            }`}
          >
            <CalendarIcon className="w-4 h-4" />
            <span>날짜만 조율</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onChangeScheduleType('date_time');
              if (timeSlots.length === 0) onChangeTimeSlots(DEFAULT_TIME_SLOTS);
            }}
            className={`p-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all ${
              scheduleType === 'date_time'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30 border border-purple-400'
                : 'bg-purple-950/30 text-purple-300 hover:bg-purple-900/40 border border-purple-500/10'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>날짜 + 시간대 조율</span>
          </button>
        </div>
      </div>

      {/* Time Slots selector if date_time */}
      {scheduleType === 'date_time' && (
        <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/20 space-y-2">
          <span className="text-xs font-semibold text-purple-300 block">포함할 시간대 선택:</span>
          <div className="flex flex-wrap gap-2">
            {DEFAULT_TIME_SLOTS.map((slot) => {
              const isSelected = timeSlots.includes(slot);
              return (
                <button
                  key={slot}
                  type="button"
                  onClick={() => toggleTimeSlot(slot)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    isSelected
                      ? 'bg-purple-600 text-white border border-purple-400'
                      : 'bg-purple-900/40 text-purple-300 border border-purple-500/20 hover:bg-purple-800/40'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3" />}
                  <span>{slot}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Action Bar (1-second weekend auto select) */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-purple-500/10">
        <button
          type="button"
          onClick={selectAllWeekends}
          className="px-3 py-2 rounded-xl text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-all flex items-center gap-1.5 shadow-sm"
        >
          <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span>이번 달 주말 전체 1초 선택</span>
        </button>

        {selectedDates.length > 0 && (
          <button
            type="button"
            onClick={clearAllDates}
            className="px-2.5 py-1.5 rounded-lg text-xs text-rose-300 hover:bg-rose-500/20 transition-all flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>선택 초기화 ({selectedDates.length})</span>
          </button>
        )}
      </div>

      {/* Calendar Header */}
      <div className="flex items-center justify-between px-2">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="p-2 rounded-xl bg-purple-950/40 text-purple-300 hover:bg-purple-900/60 border border-purple-500/20 transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-base font-bold text-white tracking-wide">
          {year}년 {month + 1}월
        </span>
        <button
          type="button"
          onClick={handleNextMonth}
          className="p-2 rounded-xl bg-purple-950/40 text-purple-300 hover:bg-purple-900/60 border border-purple-500/20 transition-all"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1.5 text-center">
        {['일', '월', '화', '수', '목', '금', '토'].map((day, idx) => (
          <div
            key={day}
            className={`text-xs font-semibold py-1.5 ${
              idx === 0 ? 'text-rose-400' : idx === 6 ? 'text-cyan-400' : 'text-purple-300/70'
            }`}
          >
            {day}
          </div>
        ))}

        {/* Empty leading cells */}
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="h-10 sm:h-12" />
        ))}

        {/* Month day cells */}
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
              onClick={() => toggleDate(dateStr)}
              className={`h-11 sm:h-12 rounded-xl font-bold text-xs sm:text-sm transition-all flex flex-col items-center justify-center relative ${
                isSelected
                  ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/40 scale-95 border border-purple-300'
                  : isWeekend
                  ? 'bg-purple-950/40 text-purple-200 hover:bg-purple-900/50 border border-purple-500/10'
                  : 'bg-purple-950/20 text-gray-300 hover:bg-purple-900/30 border border-transparent'
              }`}
            >
              <span>{dayNum}</span>
              {isSelected && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-300 absolute bottom-1" />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected dates badge preview */}
      <div className="pt-2">
        <p className="text-xs text-purple-300/80 mb-2 font-medium">
          선택된 후보 날짜 ({selectedDates.length}개):
        </p>
        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
          {selectedDates.length === 0 ? (
            <span className="text-xs text-gray-500 italic">달력에서 날짜를 클릭해 후보를 정해보세요.</span>
          ) : (
            selectedDates.map((d) => (
              <span
                key={d}
                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-purple-900/60 text-purple-200 border border-purple-500/30 flex items-center gap-1"
              >
                {d}
                <button
                  type="button"
                  onClick={() => toggleDate(d)}
                  className="hover:text-rose-400 ml-0.5"
                >
                  ×
                </button>
              </span>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
