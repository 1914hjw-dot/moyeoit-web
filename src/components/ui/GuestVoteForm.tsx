'use client';

import React, { useState, useEffect, useRef } from 'react';
import { UserCheck, Sparkles, ShieldCheck, Calendar as CalendarIcon, ChevronDown, ChevronUp, MessageSquare, Lock } from 'lucide-react';
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
  const [showOptionalFields, setShowOptionalFields] = useState(Boolean(existingVote?.note));
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
    <form onSubmit={handleSubmit} className="w-full space-y-4 my-2">
      <div className="sys-card p-5 sm:p-7 space-y-5 border-slate-200/80 shadow-md bg-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 font-black">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-900">
                {existingVote ? '내 가능 날짜 수정하기' : '✨ 내 가능 날짜 선택하기'}
              </h3>
              <p className="text-[11px] text-slate-500">
                후보 날짜는 기본 '가능'으로 설정되어 있어 불가능한 날짜만 눌러 해제하시면 됩니다.
              </p>
            </div>
          </div>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="text-xs text-slate-500 hover:text-slate-900 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 cursor-pointer font-bold transition-all"
            >
              취소
            </button>
          )}
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* 1. Primary Required Input: Nickname */}
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1.5">
            이름 / 닉네임 <span className="text-rose-500">*</span>
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
            placeholder="친구들이 나를 알아볼 수 있는 이름을 입력하세요"
            className="w-full sys-input h-11 text-xs sm:text-sm font-semibold"
          />
        </div>

        {/* 2. Primary Required Action: Candidate Date Selection */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 block">
            언제 가능하세요? <span className="text-rose-500">*</span>
          </label>
          <CalendarVoteSelector
            candidateDates={room.candidate_dates}
            availability={availability}
            onChangeAvailability={setAvailability}
            scheduleType={room.schedule_type}
            timeSlots={room.time_slots}
          />
        </div>

        {/* 3. Collapsible Optional Options (Note & PIN) */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowOptionalFields((prev) => !prev)}
            className="w-full py-2.5 px-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-slate-600 hover:text-slate-900 text-xs font-bold flex items-center justify-between transition-all cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
              <span>+ 메모 및 수정 PIN 설정 (선택 사항)</span>
            </span>
            {showOptionalFields ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {showOptionalFields && (
            <div className="mt-3 p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3.5 animate-in fade-in duration-150">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  한줄 메모 <span className="text-slate-400 font-normal">(선택)</span>
                </label>
                <input
                  type="text"
                  autoComplete="off"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="예: 27일은 저녁 7시 이후만 가능해요!"
                  className="w-full sys-input h-10 text-xs bg-white"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    나중에 수정할 때 사용할 PIN <span className="text-slate-400 font-normal">(숫자 4자리, 선택)</span>
                  </label>
                  <span className="text-[10px] text-emerald-600 flex items-center gap-0.5 font-bold">
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
                  placeholder="추후 투표 수정/삭제 시 본인 확인용 숫자 4자리"
                  className="w-full sys-input h-10 text-xs bg-white"
                />
              </div>
            </div>
          )}
        </div>

        {/* 4. Primary Submit CTA */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full sys-btn-primary h-12 text-xs sm:text-sm font-black disabled:opacity-50 shadow-lg shadow-indigo-500/20 cursor-pointer flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-white" />
          <span>{isSubmitting ? '저장 중...' : existingVote ? '투표 수정 완료' : '✨ 내 가능 날짜 제출하기'}</span>
        </button>
      </div>
    </form>
  );
};
