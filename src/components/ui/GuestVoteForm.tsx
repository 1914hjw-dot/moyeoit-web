'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, ShieldCheck, Calendar as CalendarIcon, ChevronDown, ChevronUp, MessageSquare, Eye, EyeOff, Globe } from 'lucide-react';
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
  const [showPasswordText, setShowPasswordText] = useState(false);
  const [note, setNote] = useState(existingVote?.note || '');
  const [showOptionalFields, setShowOptionalFields] = useState(Boolean(existingVote?.note));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const nicknameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!existingVote && nicknameInputRef.current) {
      nicknameInputRef.current.focus();
    }
  }, [existingVote]);

  const isFreeMode = room.date_selection_mode === 'FREE';
  const isDateTime = !isFreeMode && room.schedule_type === 'date_time';
  const allSlotKeys: { key: string; date: string; slot?: string }[] = [];

  if (isDateTime && room.time_slots.length > 0) {
    for (const d of room.candidate_dates) {
      for (const s of room.time_slots) {
        allSlotKeys.push({ key: `${d}_${s}`, date: d, slot: s });
      }
    }
  } else if (room.candidate_dates && room.candidate_dates.length > 0) {
    for (const d of room.candidate_dates) {
      allSlotKeys.push({ key: d, date: d });
    }
  }

  const [availability, setAvailability] = useState<Record<string, AvailabilityStatus>>(() => {
    if (existingVote?.availability) {
      return { ...existingVote.availability };
    }
    const initial: Record<string, AvailabilityStatus> = {};
    if (!isFreeMode && allSlotKeys.length > 0) {
      for (const item of allSlotKeys) {
        initial[item.key] = 'possible';
      }
    }
    return initial;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!nickname.trim()) {
      alert('이름 또는 닉네임을 입력해 주세요.');
      return;
    }

    const possibleKeys = Object.entries(availability).filter(
      ([, status]) => status === 'possible' || status === 'maybe'
    );

    if (isFreeMode && possibleKeys.length === 0) {
      alert('최소 1개 이상의 가능 날짜를 캘린더에서 클릭해 선택해 주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmitVote({
        room_id: room.id,
        nickname: nickname.trim(),
        password: password.trim(),
        vote_token: existingVote?.vote_token || '',
        availability,
        note: note.trim(),
      });
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : '투표 제출 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4 my-2">
      <div className="sys-card p-4 sm:p-6 space-y-4 border-slate-200/80 shadow-md bg-white rounded-3xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 font-black">
              {isFreeMode ? <Globe className="w-4 h-4 text-emerald-600" /> : <CalendarIcon className="w-4 h-4 text-indigo-600" />}
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-900">
                {existingVote ? '내 가능 날짜 수정' : '내 가능 날짜 선택하기'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {isFreeMode
                  ? '캘린더에서 본인이 참석 가능한 날짜를 자유롭게 터치하여 선택해 주세요.'
                  : '기본 \'가능\' 상태입니다. 안 되는 날짜만 눌러 해제해 주세요.'}
              </p>
            </div>
          </div>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="text-xs text-slate-500 hover:text-slate-900 px-3 py-1 rounded-xl bg-slate-100 border border-slate-200 cursor-pointer font-bold"
            >
              취소
            </button>
          )}
        </div>

        {errorMsg && (
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* 1. Essential Input: Nickname */}
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">
            이름 / 닉네임 <span className="text-rose-500">*</span>
          </label>
          <input
            ref={nicknameInputRef}
            type="text"
            required
            autoComplete="name"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="이름 또는 닉네임을 입력하세요"
            className="w-full sys-input h-11 text-xs sm:text-sm font-semibold"
          />
        </div>

        {/* 2. Core Action: Candidate Date Selection Calendar */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 block">
            가능 날짜 조율 <span className="text-rose-500">*</span>
          </label>
          <CalendarVoteSelector
            candidateDates={room.candidate_dates}
            availability={availability}
            onChangeAvailability={setAvailability}
            scheduleType={room.schedule_type}
            timeSlots={room.time_slots}
            dateSelectionMode={room.date_selection_mode}
          />
        </div>

        {/* 3. Optional Accordion (Note & PIN Password) */}
        <div>
          <button
            type="button"
            onClick={() => setShowOptionalFields((prev) => !prev)}
            className="w-full py-2 px-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-slate-600 hover:text-slate-900 text-xs font-bold flex items-center justify-between transition-all cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-slate-600" />
              <span>+ 메모 및 비밀번호 (선택)</span>
            </span>
            {showOptionalFields ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {showOptionalFields && (
            <div className="mt-2 p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">한줄 메모</label>
                <input
                  type="text"
                  autoComplete="off"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="예: 27일은 저녁 7시 이후 가능"
                  className="w-full sys-input h-10 text-xs bg-white"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700 block">수정용 비밀번호 4자리</label>
                  <span className="text-[10px] text-emerald-600 flex items-center gap-0.5 font-bold">
                    <ShieldCheck className="w-3 h-3" />
                    <span>암호화 보관</span>
                  </span>
                </div>

                <div className="relative">
                  <input
                    type={showPasswordText ? 'text' : 'password'}
                    inputMode="numeric"
                    maxLength={4}
                    autoComplete={existingVote ? 'current-password' : 'new-password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="숫자 4자리"
                    className="w-full sys-input h-10 text-xs bg-white pr-10 font-mono tracking-widest"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordText((prev) => !prev)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors cursor-pointer"
                    aria-label={showPasswordText ? '비밀번호 숨기기' : '비밀번호 보기'}
                  >
                    {showPasswordText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 4. Main Submit Button (Slate 900) */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full sys-btn-primary h-12 text-xs sm:text-sm font-black disabled:opacity-50 shadow-md cursor-pointer flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-white" />
          <span>{isSubmitting ? '저장 중...' : existingVote ? '투표 수정 완료' : '내 가능 날짜 제출하기'}</span>
        </button>
      </div>
    </form>
  );
};
