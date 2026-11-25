'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, ShieldCheck, Calendar as CalendarIcon, ChevronDown, ChevronUp, MessageSquare, Eye, EyeOff, Globe, AlertTriangle } from 'lucide-react';
import { Room, Vote, AvailabilityStatus, SubmitVoteInput } from '@/types/schema';
import { CalendarVoteSelector } from '@/components/ui/CalendarVoteSelector';
import { isSameNickname } from '@/lib/validation/nickname';

interface GuestVoteFormProps {
  room: Room;
  existingVote?: Vote | null;
  existingVotes?: Vote[];
  onSelectExistingVote?: (vote: Vote) => void;
  onInspectExistingVote?: (vote: Vote) => void;
  onSubmitVote: (input: SubmitVoteInput) => Promise<void> | void;
  onCancel?: () => void;
}

export const GuestVoteForm: React.FC<GuestVoteFormProps> = ({
  room,
  existingVote,
  existingVotes = [],
  onSelectExistingVote,
  onInspectExistingVote,
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

  const isLegacyPasswordlessEdit = Boolean(existingVote && existingVote.has_password === false);
  const trimmedNickname = nickname.trim();
  const matchedExistingVote =
    !existingVote && trimmedNickname
      ? existingVotes.find((v) => isSameNickname(v.nickname, trimmedNickname))
      : undefined;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (isLegacyPasswordlessEdit) {
      setErrorMsg('비밀번호 없이 등록된 이전 투표는 직접 수정할 수 없습니다. 투표를 삭제한 뒤 비밀번호를 설정해 다시 투표해 주세요.');
      return;
    }

    if (!trimmedNickname) {
      setErrorMsg('이름 또는 닉네임을 입력해 주세요.');
      return;
    }

    if (matchedExistingVote) {
      if (matchedExistingVote.has_password === false) {
        setErrorMsg(
          `이미 '${matchedExistingVote.nickname}' 이름으로 등록된 이전 투표가 있습니다. 기존 투표를 삭제 후 다시 투표하거나 다른 닉네임(예: ${matchedExistingVote.nickname}B)을 입력해 주세요.`
        );
      } else {
        setErrorMsg(
          `이미 투표한 이름입니다. 본인 투표 수정 버튼을 누르거나 다른 닉네임(예: ${matchedExistingVote.nickname}B)을 입력해 주세요.`
        );
      }
      return;
    }

    if (!/^\d{4}$/.test(password.trim())) {
      setErrorMsg('수정·삭제용 비밀번호를 숫자 4자리로 입력해 주세요.');
      return;
    }

    const possibleKeys = Object.entries(availability).filter(
      ([, status]) => status === 'possible' || status === 'maybe'
    );

    if (isFreeMode && possibleKeys.length === 0) {
      setErrorMsg('최소 1개 이상의 가능 날짜를 캘린더에서 클릭해 선택해 주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmitVote({
        room_id: room.id,
        intent: existingVote ? 'update' : 'create',
        ...(existingVote ? { vote_id: existingVote.id } : {}),
        nickname: trimmedNickname,
        password: password.trim(),
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

        {isLegacyPasswordlessEdit && existingVote && (
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
            <div className="flex items-start gap-2 text-xs text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                비밀번호 없이 등록된 이전 투표는 직접 수정할 수 없습니다. 투표를 삭제한 뒤 숫자 4자리 비밀번호를 설정해 다시 투표해 주세요.
              </p>
            </div>
            {onInspectExistingVote && (
              <button
                type="button"
                onClick={() => onInspectExistingVote(existingVote)}
                className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                투표 확인·삭제 화면으로 돌아가기
              </button>
            )}
          </div>
        )}

        {errorMsg && (
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* 1. Essential Inputs: Nickname & 4-Digit PIN */}
        <div className="space-y-3">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              이름 / 닉네임 <span className="text-rose-500">*</span>
            </label>
            <input
              ref={nicknameInputRef}
              type="text"
              required
              readOnly={Boolean(existingVote)}
              autoComplete="name"
              value={nickname}
              onChange={(e) => {
                setNickname(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              placeholder="이름 또는 닉네임을 입력하세요"
              className={`w-full sys-input h-11 text-xs sm:text-sm font-semibold ${
                existingVote ? 'bg-slate-100 text-slate-700 cursor-not-allowed' : ''
              }`}
            />

            {matchedExistingVote && (
              <div className="mt-2 p-3 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
                {matchedExistingVote.has_password === false ? (
                  <>
                    <p className="text-xs text-amber-900 leading-relaxed">
                      이미 <strong className="font-black">&apos;{matchedExistingVote.nickname}&apos;</strong> 이름으로 비밀번호 없이 등록된 이전 투표가 있습니다. 본인의 투표라면 삭제 후 비밀번호를 설정해 다시 투표해 주세요. 동명이인이라면 구분되는 이름(예: {matchedExistingVote.nickname}B)을 입력해 주세요.
                    </p>
                    {onInspectExistingVote && (
                      <button
                        type="button"
                        onClick={() => onInspectExistingVote(matchedExistingVote)}
                        className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors cursor-pointer"
                      >
                        기존 투표 확인·삭제하기
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <p className="text-xs text-amber-900 leading-relaxed">
                      이미 <strong className="font-black">&apos;{matchedExistingVote.nickname}&apos;</strong> 이름으로 등록된 투표가 있습니다. 본인의 투표를 수정하려면 아래 버튼을 누르고, 동명이인이라면 구분되는 이름(예: {matchedExistingVote.nickname}B)을 입력해 주세요.
                    </p>
                    {onSelectExistingVote && (
                      <button
                        type="button"
                        onClick={() => onSelectExistingVote(matchedExistingVote)}
                        className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors cursor-pointer"
                      >
                        이 이름으로 내 투표 수정하기
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700 block">
                {existingVote
                  ? '비밀번호 확인 (숫자 4자리)'
                  : '수정·삭제용 비밀번호 (숫자 4자리)'}{' '}
                <span className="text-rose-500">*</span>
              </label>
              <span className="text-[10px] text-emerald-600 flex items-center gap-0.5 font-bold">
                <ShieldCheck className="w-3 h-3" />
                <span>서버 암호화 검증</span>
              </span>
            </div>

            <div className="relative">
              <input
                type={showPasswordText ? 'text' : 'password'}
                inputMode="numeric"
                pattern="\d{4}"
                maxLength={4}
                required
                disabled={isLegacyPasswordlessEdit}
                autoComplete={existingVote ? 'current-password' : 'new-password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value.replace(/\D/g, '').slice(0, 4));
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="숫자 4자리"
                className="w-full sys-input h-11 text-xs sm:text-sm bg-white pr-10 font-mono tracking-widest disabled:bg-slate-100 disabled:text-slate-400"
              />
              <button
                type="button"
                disabled={isLegacyPasswordlessEdit}
                onClick={() => setShowPasswordText((prev) => !prev)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors cursor-pointer disabled:opacity-40"
                aria-label={showPasswordText ? '비밀번호 숨기기' : '비밀번호 보기'}
              >
                {showPasswordText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {existingVote
                ? '투표 등록 시 설정한 숫자 4자리 비밀번호를 입력해야 수정됩니다.'
                : '다른 기기에서도 본인의 투표를 수정·삭제할 때 확인용으로 사용됩니다.'}
            </p>
          </div>
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
            readOnly={isLegacyPasswordlessEdit}
          />
        </div>

        {/* 3. Optional Accordion (Note) */}
        <div>
          <button
            type="button"
            onClick={() => setShowOptionalFields((prev) => !prev)}
            className="w-full py-2 px-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-slate-600 hover:text-slate-900 text-xs font-bold flex items-center justify-between transition-all cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-slate-600" />
              <span>+ 한줄 메모 (선택)</span>
            </span>
            {showOptionalFields ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {showOptionalFields && (
            <div className="mt-2 p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">한줄 메모</label>
                <input
                  type="text"
                  autoComplete="off"
                  disabled={isLegacyPasswordlessEdit}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="예: 27일은 저녁 7시 이후 가능"
                  className="w-full sys-input h-10 text-xs bg-white disabled:bg-slate-100"
                />
              </div>
            </div>
          )}
        </div>

        {/* 4. Main Submit Button (Slate 900) */}
        <button
          type="submit"
          disabled={isSubmitting || isLegacyPasswordlessEdit}
          className="w-full sys-btn-primary h-12 text-xs sm:text-sm font-black disabled:opacity-50 shadow-md cursor-pointer flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-white" />
          <span>{isSubmitting ? '저장 중...' : existingVote ? '투표 수정 완료' : '내 가능 날짜 제출하기'}</span>
        </button>
      </div>
    </form>
  );
};
