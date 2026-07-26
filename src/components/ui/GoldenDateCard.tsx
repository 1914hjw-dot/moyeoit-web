'use client';

import React from 'react';
import { Crown, Sparkles, CheckCircle2, AlertCircle, ThumbsUp, ShieldCheck, Users, Share2 } from 'lucide-react';
import { GoldenDateRecommendation } from '@/types/schema';
import { formatKoreanDate } from '@/lib/analytics';

interface GoldenDateCardProps {
  recommendations: GoldenDateRecommendation[];
  onConfirmDate?: (date: string, timeSlot?: string) => void;
  onShare?: () => void;
  selectedConfirmedKey?: string;
  isHost?: boolean;
}

export const GoldenDateCard: React.FC<GoldenDateCardProps> = ({
  recommendations,
  onConfirmDate,
  onShare,
  selectedConfirmedKey,
  isHost = false,
}) => {
  if (recommendations.length === 0) {
    return (
      <div className="w-full sys-card p-6 text-center space-y-3 border-dashed border-zinc-800 my-4 bg-zinc-950/60">
        <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
          <Users className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-extrabold text-zinc-200">👥 아직 다른 참여자의 응답이 없어요</h4>
          <p className="text-xs text-zinc-400">
            친구들에게 링크를 공유하면 가장 많은 인원이 가능한 최적의 날짜를 찾아드려요!
          </p>
        </div>
        {onShare && (
          <button
            type="button"
            onClick={onShare}
            className="px-4 py-2 rounded-xl bg-amber-400 text-zinc-950 font-extrabold text-xs inline-flex items-center gap-1.5 shadow-md cursor-pointer hover:bg-amber-300 transition-all"
          >
            <Share2 className="w-3.5 h-3.5 fill-zinc-950" />
            <span>친구들에게 초대 링크 전달하기</span>
          </button>
        )}
      </div>
    );
  }

  const top1 = recommendations[0];
  const runnerUps = recommendations.slice(1);

  // Dynamic import of canvas-confetti
  const triggerConfetti = async () => {
    try {
      const confettiModule = await import('canvas-confetti');
      const confetti = confettiModule.default;
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#10b981', '#f59e0b', '#6366f1'],
      });
    } catch {
      // Ignore
    }
  };

  const isTop1Confirmed = selectedConfirmedKey === top1.key;

  // Format attendee names nicely (e.g. "민수 · 지현 · 수진" or "민수 · 지현 외 3명")
  const formatAttendeeNames = (names: string[]): string => {
    if (names.length === 0) return '가능 인원 없음';
    if (names.length <= 3) return names.join(' · ');
    return `${names.slice(0, 3).join(' · ')} 외 ${names.length - 3}명`;
  };

  return (
    <div className="w-full space-y-4 my-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Crown className="w-4 h-4 text-amber-400 fill-amber-400" />
          <h3 className="text-sm font-extrabold text-zinc-100 tracking-tight">
            🎉 현재 가장 추천하는 날짜
          </h3>
        </div>
        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
          자동 계산됨
        </span>
      </div>

      {/* TOP 1 Focused Primary Decision Card */}
      <div
        className={`relative rounded-3xl p-5 transition-all ${
          isTop1Confirmed
            ? 'bg-gradient-to-b from-emerald-950/40 via-zinc-900 to-zinc-900 border-2 border-emerald-500 shadow-xl'
            : 'bg-gradient-to-b from-amber-500/10 via-zinc-900 to-zinc-900 border-2 border-amber-400/80 shadow-xl'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-400 text-zinc-950 uppercase tracking-wider">
            🏆 1위 최적 날짜
          </span>
          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            {top1.match_percentage}% 참석 ({top1.possible_count}/{top1.total_voters}명)
          </span>
        </div>

        <div className="my-3">
          <h4 className="text-xl sm:text-2xl font-black text-zinc-100">
            {formatKoreanDate(top1.date)}
          </h4>
          {top1.time_slot && (
            <span className="text-xs font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 inline-block mt-1">
              [{top1.time_slot}]
            </span>
          )}
        </div>

        {/* Attendee Names Breakdown */}
        <div className="p-3 rounded-2xl bg-zinc-950/70 border border-zinc-800 space-y-1.5 text-xs mb-4">
          <div className="flex items-start gap-1.5 text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span className="font-semibold text-zinc-200">
              가능: {formatAttendeeNames(top1.attendee_names)}
            </span>
          </div>

          {top1.absentee_list.length > 0 && (
            <div className="flex items-start gap-1.5 text-rose-400">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span className="font-medium text-zinc-400">
                불참: {top1.absentee_list.map((a) => a.nickname).slice(0, 3).join(' · ')}
                {top1.absentee_list.length > 3 ? ` 외 ${top1.absentee_list.length - 3}명` : ''}
              </span>
            </div>
          )}
        </div>

        {/* Role-based Action Button: Only Host can confirm date, participants view status */}
        {isHost && onConfirmDate ? (
          <button
            type="button"
            onClick={() => {
              triggerConfetti();
              onConfirmDate(top1.date, top1.time_slot);
            }}
            className={`w-full py-3 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
              isTop1Confirmed
                ? 'bg-emerald-500 text-zinc-950'
                : 'sys-btn-primary'
            }`}
          >
            <ThumbsUp className="w-4 h-4" />
            <span>{isTop1Confirmed ? '이 날짜로 약속 확정 완료!' : '👑 방장: 이 날짜로 모임 확정하기'}</span>
          </button>
        ) : isTop1Confirmed ? (
          <div className="w-full py-3 rounded-2xl text-xs font-extrabold bg-emerald-500 text-zinc-950 flex items-center justify-center gap-2 shadow-md">
            <ShieldCheck className="w-4 h-4" />
            <span>🎉 방장에 의해 이 날짜로 모임이 확정되었습니다!</span>
          </div>
        ) : null}
      </div>

      {/* TOP 2 & TOP 3 Runner-up Compact Rows */}
      {runnerUps.length > 0 && (
        <div className="space-y-2">
          {runnerUps.map((rec) => {
            const isConfirmed = selectedConfirmedKey === rec.key;

            return (
              <div
                key={rec.key}
                className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-zinc-800 text-zinc-400 flex items-center justify-center font-bold text-[11px]">
                    {rec.rank}위
                  </span>
                  <div>
                    <span className="font-bold text-zinc-200">
                      {formatKoreanDate(rec.date)}
                    </span>
                    {rec.time_slot && (
                      <span className="text-[11px] text-amber-300 ml-1.5">[{rec.time_slot}]</span>
                    )}
                    <p className="text-[10px] text-zinc-400 mt-0.5">
                      가능: {formatAttendeeNames(rec.attendee_names)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-zinc-400 font-medium text-[11px]">
                    <strong className="text-emerald-400 font-bold">{rec.possible_count}명</strong> / {rec.total_voters}명
                  </span>

                  {isHost && onConfirmDate && (
                    <button
                      type="button"
                      onClick={() => onConfirmDate(rec.date, rec.time_slot)}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                        isConfirmed
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                      }`}
                    >
                      {isConfirmed ? '확정됨' : '선택'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
