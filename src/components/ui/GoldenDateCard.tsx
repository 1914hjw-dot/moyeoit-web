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
      <div className="w-full sys-card p-6 text-center space-y-3 border-dashed border-slate-200 my-4 bg-white">
        <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
          <Users className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-extrabold text-slate-900">👥 아직 다른 참여자의 응답이 없어요</h4>
          <p className="text-xs text-slate-500">
            친구들에게 링크를 공유하면 가장 많은 인원이 가능한 최적의 날짜를 찾아드려요!
          </p>
        </div>
        {onShare && (
          <button
            type="button"
            onClick={onShare}
            className="px-4 py-2.5 rounded-2xl bg-indigo-600 text-white font-black text-xs inline-flex items-center gap-1.5 shadow-md shadow-indigo-500/20 cursor-pointer hover:bg-indigo-700 transition-all"
          >
            <Share2 className="w-3.5 h-3.5 fill-white" />
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
          <Crown className="w-4 h-4 text-amber-500 fill-amber-500" />
          <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
            🎉 현재 가장 추천하는 날짜
          </h3>
        </div>
        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
          자동 계산됨
        </span>
      </div>

      {/* TOP 1 Focused Primary Decision Card */}
      <div
        className={`relative rounded-3xl p-6 transition-all ${
          isTop1Confirmed
            ? 'bg-gradient-to-b from-emerald-50 via-white to-white border-2 border-emerald-500 shadow-xl shadow-emerald-500/10'
            : 'bg-gradient-to-b from-amber-50 via-white to-white border-2 border-amber-300 shadow-xl shadow-amber-500/10'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="px-3 py-0.5 rounded-full text-xs font-black bg-amber-400 text-slate-950 uppercase tracking-wider shadow-sm">
            🏆 1위 최적 날짜
          </span>
          <span className="text-xs font-extrabold text-emerald-600 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            {top1.match_percentage}% 참석 ({top1.possible_count}/{top1.total_voters}명)
          </span>
        </div>

        <div className="my-3">
          <h4 className="text-xl sm:text-2xl font-black text-slate-900">
            {formatKoreanDate(top1.date)}
          </h4>
          {top1.time_slot && (
            <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-lg border border-amber-200 inline-block mt-1">
              [{top1.time_slot}]
            </span>
          )}
        </div>

        {/* Attendee Names Breakdown */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs mb-4">
          <div className="flex items-start gap-1.5 text-emerald-700">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-600" />
            <span className="font-bold text-slate-800">
              가능: {formatAttendeeNames(top1.attendee_names)}
            </span>
          </div>

          {top1.absentee_list.length > 0 && (
            <div className="flex items-start gap-1.5 text-rose-600">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-500" />
              <span className="font-semibold text-slate-500">
                불참: {top1.absentee_list.map((a) => a.nickname).slice(0, 3).join(' · ')}
                {top1.absentee_list.length > 3 ? ` 외 ${top1.absentee_list.length - 3}명` : ''}
              </span>
            </div>
          )}
        </div>

        {/* Role-based Action Button */}
        {isHost && onConfirmDate ? (
          <button
            type="button"
            onClick={() => {
              triggerConfetti();
              onConfirmDate(top1.date, top1.time_slot);
            }}
            className={`w-full py-3.5 rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
              isTop1Confirmed
                ? 'bg-emerald-600 text-white shadow-emerald-600/20'
                : 'sys-btn-primary'
            }`}
          >
            <ThumbsUp className="w-4 h-4 text-white" />
            <span>{isTop1Confirmed ? '이 날짜로 약속 확정 완료!' : '👑 방장: 이 날짜로 모임 확정하기'}</span>
          </button>
        ) : isTop1Confirmed ? (
          <div className="w-full py-3.5 rounded-2xl text-xs font-black bg-emerald-600 text-white flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20">
            <ShieldCheck className="w-4 h-4 text-white" />
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
                className="p-3.5 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-between gap-3 text-xs shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-black text-xs">
                    {rec.rank}위
                  </span>
                  <div>
                    <span className="font-extrabold text-slate-900">
                      {formatKoreanDate(rec.date)}
                    </span>
                    {rec.time_slot && (
                      <span className="text-[11px] text-amber-700 font-bold ml-1.5">[{rec.time_slot}]</span>
                    )}
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      가능: {formatAttendeeNames(rec.attendee_names)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-slate-500 font-semibold text-[11px]">
                    <strong className="text-emerald-600 font-extrabold">{rec.possible_count}명</strong> / {rec.total_voters}명
                  </span>

                  {isHost && onConfirmDate && (
                    <button
                      type="button"
                      onClick={() => onConfirmDate(rec.date, rec.time_slot)}
                      className={`px-3 py-1 rounded-xl text-[11px] font-extrabold transition-all cursor-pointer ${
                        isConfirmed
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
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
