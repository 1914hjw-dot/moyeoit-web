'use client';

import React from 'react';
import { Crown, Sparkles, CheckCircle2, AlertCircle, ThumbsUp } from 'lucide-react';
import { GoldenDateRecommendation } from '@/types/schema';
import { formatKoreanDate } from '@/lib/analytics';

interface GoldenDateCardProps {
  recommendations: GoldenDateRecommendation[];
  onConfirmDate?: (date: string, timeSlot?: string) => void;
  selectedConfirmedKey?: string;
}

export const GoldenDateCard: React.FC<GoldenDateCardProps> = ({
  recommendations,
  onConfirmDate,
  selectedConfirmedKey,
}) => {
  if (recommendations.length === 0) {
    return (
      <div className="w-full sys-card p-6 text-center border-dashed border-zinc-800 my-4">
        <p className="text-sm font-semibold text-zinc-300">
          아직 제출된 투표가 없거나 일정이 계산 중입니다.
        </p>
        <p className="text-xs text-zinc-500 mt-1">
          초대 링크를 전달하여 첫 투표를 시작해 보세요.
        </p>
      </div>
    );
  }

  // Dynamic import of canvas-confetti for JS Bundle Size Minimization & Fast Initial Load
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
      // Ignore in SSR or error
    }
  };

  return (
    <div className="w-full space-y-4 my-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Crown className="w-4 h-4 text-amber-400 fill-amber-400" />
          <h3 className="text-sm font-bold text-zinc-100 tracking-tight">
            최적 약속 날짜 TOP 3
          </h3>
        </div>
        <span className="text-[11px] font-semibold text-zinc-400 bg-zinc-900 px-2.5 py-0.5 rounded-full border border-zinc-800">
          자동 계산됨
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {recommendations.map((rec) => {
          const isTop1 = rec.rank === 1;
          const isConfirmed = selectedConfirmedKey === rec.key;

          return (
            <div
              key={rec.key}
              className={`relative rounded-2xl p-4 sm:p-5 transition-all flex flex-col justify-between ${
                isTop1
                  ? 'bg-zinc-900 border-2 border-amber-400/80 shadow-lg shadow-amber-500/5'
                  : 'bg-zinc-900/60 border border-zinc-800'
              }`}
            >
              {/* Badge */}
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`px-2.5 py-0.5 rounded-md text-xs font-bold ${
                    rec.rank === 1
                      ? 'bg-amber-400 text-zinc-950'
                      : rec.rank === 2
                      ? 'bg-zinc-200 text-zinc-950'
                      : 'bg-zinc-800 text-zinc-300'
                  }`}
                >
                  TOP {rec.rank}
                </span>

                <div className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <Sparkles className="w-3 h-3" />
                  <span>{rec.match_percentage}% 참석</span>
                </div>
              </div>

              {/* Date Info */}
              <div className="my-2">
                <h4 className="text-base sm:text-lg font-extrabold text-zinc-100">
                  {formatKoreanDate(rec.date)}
                </h4>
                {rec.time_slot && (
                  <p className="text-xs font-semibold text-amber-300 mt-0.5">
                    [{rec.time_slot}]
                  </p>
                )}
                <p className="text-xs text-zinc-400 mt-1">
                  가능 인원: <span className="font-bold text-emerald-400">{rec.possible_count}명</span> / {rec.total_voters}명
                </p>
              </div>

              {/* Attendee / Absentee breakdown */}
              <div className="my-3 p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/80 space-y-1.5 text-xs">
                <div className="flex items-start gap-1.5 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span className="font-medium text-zinc-200 line-clamp-2">
                    {rec.attendee_names.length > 0 ? rec.attendee_names.join(', ') : '가능 인원 없음'}
                  </span>
                </div>

                {rec.absentee_list.length > 0 && (
                  <div className="flex items-start gap-1.5 text-rose-400">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span className="font-medium text-zinc-400">
                      불참: {rec.absentee_list.map((a) => `${a.nickname}${a.note ? `(${a.note})` : ''}`).join(', ')}
                    </span>
                  </div>
                )}
              </div>

              {/* Confirm CTA */}
              {onConfirmDate && (
                <button
                  type="button"
                  onClick={() => {
                    if (isTop1) triggerConfetti();
                    onConfirmDate(rec.date, rec.time_slot);
                  }}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    isConfirmed
                      ? 'bg-emerald-500 text-zinc-950 font-extrabold'
                      : isTop1
                      ? 'sys-btn-primary'
                      : 'sys-btn-secondary'
                  }`}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>{isConfirmed ? '이 날짜로 확정됨' : '이 날짜로 확정하기'}</span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
