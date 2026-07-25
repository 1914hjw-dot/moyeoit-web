'use client';

import React, { useState, useEffect } from 'react';
import { UserCheck, KeyRound, MessageSquare, Check, HelpCircle, X, Sparkles, CheckCheck } from 'lucide-react';
import { Room, Vote, AvailabilityStatus, SubmitVoteInput } from '@/types/schema';
import { formatKoreanDate } from '@/lib/analytics';

interface GuestVoteFormProps {
  room: Room;
  existingVote?: Vote | null;
  onSubmitVote: (input: SubmitVoteInput) => void;
  onCancel?: () => void;
}

export const GuestVoteForm: React.FC<GuestVoteFormProps> = ({
  room,
  existingVote,
  onSubmitVote,
  onCancel,
}) => {
  const [nickname, setNickname] = useState(existingVote?.nickname || '');
  const [password, setPassword] = useState('');
  const [note, setNote] = useState(existingVote?.note || '');

  // Build key list based on candidate_dates and time_slots
  const isDateTime = room.schedule_type === 'date_time';
  const allSlotKeys: { key: string; date: string; slot?: string }[] = [];

  if (isDateTime && room.time_slots.length > 0) {
    for (const d of room.candidate_dates) {
      for (const s of room.time_slots) {
        allSlotKeys.push({ key: `${d}_${s}`, date: d, slot: s });
      }
    }
  } else {
    for (const d of room.candidate_dates) {
      allSlotKeys.push({ key: d, date: d });
    }
  }

  // State for candidate availability map
  const [availability, setAvailability] = useState<Record<string, AvailabilityStatus>>(() => {
    if (existingVote?.availability) {
      return { ...existingVote.availability };
    }
    // Default all to 'possible' for 10-second fast voting
    const initial: Record<string, AvailabilityStatus> = {};
    for (const item of allSlotKeys) {
      initial[item.key] = 'possible';
    }
    return initial;
  });

  const setStatus = (key: string, status: AvailabilityStatus) => {
    setAvailability((prev) => ({
      ...prev,
      [key]: status,
    }));
  };

  const setAllStatus = (status: AvailabilityStatus) => {
    const updated: Record<string, AvailabilityStatus> = {};
    for (const item of allSlotKeys) {
      updated[item.key] = status;
    }
    setAvailability(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) {
      alert('닉네임을 입력해 주세요.');
      return;
    }

    onSubmitVote({
      room_id: room.id,
      nickname: nickname.trim(),
      password,
      availability,
      note: note.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="w-full glass-card rounded-2xl p-5 border border-purple-500/30 my-6 space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-purple-600/30 text-purple-300 border border-purple-500/30">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white">
              {existingVote ? '내 투표 수정하기' : '⚡ 10초 투표 참여하기'}
            </h3>
            <p className="text-xs text-purple-300">
              로그인 없이 닉네임만 적으면 바로 완료됩니다.
            </p>
          </div>
        </div>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-xs text-gray-400 hover:text-white px-2 py-1"
          >
            취소
          </button>
        )}
      </div>

      {/* User Info inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-purple-300 block mb-1">
            닉네임 <span className="text-rose-400">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              required
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="예: 홍길동, 닉네임"
              className="w-full px-3.5 py-2.5 rounded-xl bg-purple-950/40 border border-purple-500/30 text-white text-xs font-semibold placeholder:text-gray-500 focus:outline-none focus:border-purple-400 transition-all"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-purple-300 block mb-1">
            수정용 비밀번호 4자리 <span className="text-purple-400/60">(선택)</span>
          </label>
          <div className="relative">
            <input
              type="password"
              maxLength={4}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="숫자 4자리 (투표 수정 시 사용)"
              className="w-full px-3.5 py-2.5 rounded-xl bg-purple-950/40 border border-purple-500/30 text-white text-xs font-semibold placeholder:text-gray-500 focus:outline-none focus:border-purple-400 transition-all"
            />
          </div>
        </div>
      </div>

      {/* One line note */}
      <div>
        <label className="text-xs font-semibold text-purple-300 block mb-1">
          한줄 메모 <span className="text-purple-400/60">(선택)</span>
        </label>
        <div className="relative">
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="예: 27일은 저녁 7시 이후만 가능해요!"
            className="w-full px-3.5 py-2.5 rounded-xl bg-purple-950/40 border border-purple-500/30 text-white text-xs font-semibold placeholder:text-gray-500 focus:outline-none focus:border-purple-400 transition-all"
          />
        </div>
      </div>

      {/* Quick All Buttons */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-xs font-bold text-purple-200">후보 날짜/시간별 가능 여부 선택:</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setAllStatus('possible')}
            className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 transition-all flex items-center gap-1"
          >
            <CheckCheck className="w-3 h-3" />
            <span>전체 가능</span>
          </button>
          <button
            type="button"
            onClick={() => setAllStatus('impossible')}
            className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 transition-all flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            <span>전체 불가능</span>
          </button>
        </div>
      </div>

      {/* Availability Selector Grid */}
      <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
        {allSlotKeys.map((item) => {
          const currentStatus = availability[item.key] || 'possible';

          return (
            <div
              key={item.key}
              className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/15 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <div>
                <span className="text-xs font-bold text-white block">
                  {formatKoreanDate(item.date)}
                </span>
                {item.slot && (
                  <span className="text-[11px] font-semibold text-amber-300 block">
                    [{item.slot}]
                  </span>
                )}
              </div>

              {/* 3 State Toggle Buttons (Possible / Maybe / Impossible) */}
              <div className="grid grid-cols-3 gap-1.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setStatus(item.key, 'possible')}
                  className={`py-1.5 px-3 rounded-lg text-xs font-extrabold flex items-center justify-center gap-1 transition-all ${
                    currentStatus === 'possible'
                      ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/30 scale-95 border border-emerald-300'
                      : 'bg-purple-950/40 text-gray-400 hover:text-emerald-300 border border-purple-500/10'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>가능</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStatus(item.key, 'maybe')}
                  className={`py-1.5 px-3 rounded-lg text-xs font-extrabold flex items-center justify-center gap-1 transition-all ${
                    currentStatus === 'maybe'
                      ? 'bg-amber-400 text-black shadow-md shadow-amber-500/30 scale-95 border border-amber-300'
                      : 'bg-purple-950/40 text-gray-400 hover:text-amber-300 border border-purple-500/10'
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>세모</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStatus(item.key, 'impossible')}
                  className={`py-1.5 px-3 rounded-lg text-xs font-extrabold flex items-center justify-center gap-1 transition-all ${
                    currentStatus === 'impossible'
                      ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30 scale-95 border border-rose-300'
                      : 'bg-purple-950/40 text-gray-400 hover:text-rose-300 border border-purple-500/10'
                  }`}
                >
                  <X className="w-3.5 h-3.5" />
                  <span>불가</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full py-3.5 rounded-xl gradient-button text-white font-extrabold text-sm shadow-xl flex items-center justify-center gap-2 transform active:scale-95"
      >
        <Sparkles className="w-4 h-4" />
        <span>{existingVote ? '투표 수정 완료' : '투표 제출하고 결과 확인하기'}</span>
      </button>
    </form>
  );
};
