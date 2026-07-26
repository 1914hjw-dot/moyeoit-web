'use client';

import React, { useState, useEffect, useRef } from 'react';
import { UserCheck, Sparkles, ShieldCheck, Calendar as CalendarIcon } from 'lucide-react';
import { Room, Vote, AvailabilityStatus, SubmitVoteInput } from '@/types/schema';
import { CalendarVoteSelector } from '@/components/ui/CalendarVoteSelector';

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

  // Auto focus nickname input on mount
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

  // Pre-fill all candidate dates to 'possible' by default for instant opt-out voting
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
    <form onSubmit={handleSubmit} className="w-full space-y-4 my-4">
      <div className="sys-card p-5 sm:p-6 space-y-5 border-zinc-800 shadow-xl bg-zinc-950/90">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-400 text-zinc-950 font-black">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-zinc-100">
                {existingVote ? '내 투표 수정하기' : '✨ 내 가능한 날짜 선택하기'}
              </h3>
              <p className="text-[11px] text-zinc-400">
                후보 날짜는 기본 '가능' 처리되어 있어, 안 되는 날짜만 눌러주시면 됩니다.
              </p>
            </div>
          </div>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="text-xs text-zinc-400 hover:text-zinc-200 px-2 py-1 cursor-pointer font-bold"
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
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="예: 홍길동"
              className="w-full sys-input h-11 text-xs"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-zinc-300 block">
                투표 수정용 4자리 숫자 <span className="text-zinc-500">(선택)</span>
              </label>
              <span className="text-[10px] text-emerald-400 flex items-center gap-0.5">
                <ShieldCheck className="w-3 h-3" />
                <span>암호화 보관</span>
              </span>
            </div>
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              autoComplete="off"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="나중에 투표를 수정할 때 사용할 숫자 4자리"
              className="w-full sys-input h-11 text-xs"
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
            autoComplete="off"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="예: 27일은 저녁 7시 이후만 가능해요!"
            className="w-full sys-input h-11 text-xs"
          />
        </div>

        {/* Calendar Based Voting Component */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-zinc-300 block">
            후보 날짜별 가능 여부 선택 <span className="text-rose-400">*</span>
          </label>
          <CalendarVoteSelector
            candidateDates={room.candidate_dates}
            availability={availability}
            onChangeAvailability={setAvailability}
            scheduleType={room.schedule_type}
            timeSlots={room.time_slots}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full sys-btn-primary h-12 text-xs sm:text-sm font-extrabold disabled:opacity-50 shadow-lg cursor-pointer flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>{isSubmitting ? '저장 중...' : existingVote ? '투표 수정 완료' : '내 가능 날짜 제출하기'}</span>
        </button>
      </div>
    </form>
  );
};
