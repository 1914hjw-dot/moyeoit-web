'use client';

import React, { useState, useEffect, useRef } from 'react';
import { UserCheck, Check, HelpCircle, X, Sparkles, CheckCheck, ShieldCheck } from 'lucide-react';
import { Room, Vote, AvailabilityStatus, SubmitVoteInput } from '@/types/schema';
import { formatKoreanDate } from '@/lib/analytics';

interface GuestVoteFormProps {
  room: Room;
  existingVote?: Vote | null;
  onSubmitVote: (input: SubmitVoteInput) => Promise<void> | void;
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const nicknameInputRef = useRef<HTMLInputElement>(null);

  // Auto focus nickname input on mount for zero-friction typing
  useEffect(() => {
    if (!existingVote && nicknameInputRef.current) {
      nicknameInputRef.current.focus();
    }
  }, [existingVote]);

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

  // Pre-fill all dates to 'possible' by default for 3-second instant voting!
  const [availability, setAvailability] = useState<Record<string, AvailabilityStatus>>(() => {
    if (existingVote?.availability) {
      return { ...existingVote.availability };
    }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!nickname.trim()) {
      alert('닉네임을 입력해 주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmitVote({
        room_id: room.id,
        nickname: nickname.trim(),
        password: password.trim(),
        availability,
        note: note.trim(),
      });
    } catch (err: any) {
      setErrorMsg(err.message || '투표 제출 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full sys-card p-5 sm:p-6 my-6 space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border-subtle)]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300">
            <UserCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-100">
              {existingVote ? '내 투표 수정하기' : '⚡ 10초 만에 투표 완료하기'}
            </h3>
            <p className="text-xs text-zinc-400">
              모든 날짜가 기본 '가능' 처리되어 있어, 안 되는 날짜만 눌러주시면 됩니다.
            </p>
          </div>
        </div>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-xs text-zinc-500 hover:text-zinc-200 px-2 py-1 cursor-pointer"
          >
            취소
          </button>
        )}
      </div>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* User Info inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-zinc-300 block mb-1">
            닉네임 <span className="text-rose-400">*</span>
          </label>
          <input
            ref={nicknameInputRef}
            type="text"
            required
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="예: 홍길동"
            className="w-full sys-input"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-zinc-300 block">
              수정 비밀번호 <span className="text-zinc-500">(선택)</span>
            </label>
            <span className="text-[10px] text-emerald-400 flex items-center gap-0.5">
              <ShieldCheck className="w-3 h-3" />
              <span>암호화 보관</span>
            </span>
          </div>
          <input
            type="password"
            maxLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="수정용 비밀번호 4자리"
            className="w-full sys-input"
          />
        </div>
      </div>

      {/* One line note */}
      <div>
        <label className="text-xs font-semibold text-zinc-300 block mb-1">
          한줄 메모 <span className="text-zinc-500">(선택)</span>
        </label>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="예: 27일은 저녁 7시 이후만 가능해요!"
          className="w-full sys-input"
        />
      </div>

      {/* Quick 1-Tap All Buttons */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-xs font-bold text-zinc-300">날짜별 가능 여부 (기본 전체 가능):</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setAllStatus('possible')}
            className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all flex items-center gap-1 cursor-pointer"
          >
            <CheckCheck className="w-3 h-3" />
            <span>전체 가능</span>
          </button>
          <button
            type="button"
            onClick={() => setAllStatus('impossible')}
            className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-rose-500/10 text-rose-300 border border-rose-500/20 hover:bg-rose-500/20 transition-all flex items-center gap-1 cursor-pointer"
          >
            <X className="w-3 h-3" />
            <span>전체 불가</span>
          </button>
        </div>
      </div>

      {/* Availability Selector Grid */}
      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {allSlotKeys.map((item) => {
          const currentStatus = availability[item.key] || 'possible';

          return (
            <div
              key={item.key}
              className="p-3 rounded-xl bg-zinc-900/60 border border-[var(--color-border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <div>
                <span className="text-xs font-bold text-zinc-100 block">
                  {formatKoreanDate(item.date)}
                </span>
                {item.slot && (
                  <span className="text-[11px] font-semibold text-amber-300 block">
                    [{item.slot}]
                  </span>
                )}
              </div>

              {/* 3 State Touch Buttons */}
              <div className="grid grid-cols-3 gap-1.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setStatus(item.key, 'possible')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    currentStatus === 'possible'
                      ? 'bg-emerald-500 text-zinc-950 font-extrabold shadow-sm'
                      : 'bg-zinc-800/40 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>가능</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStatus(item.key, 'maybe')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    currentStatus === 'maybe'
                      ? 'bg-amber-400 text-zinc-950 font-extrabold shadow-sm'
                      : 'bg-zinc-800/40 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>세모</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStatus(item.key, 'impossible')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    currentStatus === 'impossible'
                      ? 'bg-rose-500 text-white font-extrabold shadow-sm'
                      : 'bg-zinc-800/40 text-zinc-400 hover:text-zinc-200'
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
        disabled={isSubmitting}
        className="w-full sys-btn-primary text-xs font-extrabold disabled:opacity-50"
      >
        <Sparkles className="w-4 h-4" />
        <span>{isSubmitting ? '저장 중...' : existingVote ? '투표 수정 완료' : '투표 완료하고 결과 확인하기'}</span>
      </button>
    </form>
  );
};
