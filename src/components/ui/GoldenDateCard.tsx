'use client';

import React from 'react';
import { Crown, Sparkles, CheckCircle2, AlertCircle, CalendarCheck, ThumbsUp } from 'lucide-react';
import confetti from 'canvas-confetti';
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
      <div className="w-full glass-card rounded-2xl p-6 text-center border border-purple-500/20 my-4">
        <p className="text-sm font-semibold text-purple-300">
          아직 제출된 투표가 없거나 가능한 날짜가 계산되는 중입니다.
        </p>
        <p className="text-xs text-gray-400 mt-1">
          초대 링크를 전달하여 첫 번째 투표를 참여해보세요!
        </p>
      </div>
    );
  }

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'],
      });
    } catch {
      // Ignore if canvas-confetti fails in SSR
    }
  };

  return (
    <div className="w-full space-y-4 my-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Crown className="w-5 h-5 text-amber-400 fill-amber-400" />
          <h3 className="text-base font-extrabold text-white tracking-wide">
            🏆 전원 참석 가능 황금 날짜 TOP 3
          </h3>
        </div>
        <span className="text-xs font-semibold text-amber-300/80 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
          자동 계산 완료
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {recommendations.map((rec) => {
          const isTop1 = rec.rank === 1;
          const isConfirmed = selectedConfirmedKey === rec.key;

          return (
            <div
              key={rec.key}
              className={`relative rounded-2xl p-5 transition-all glass-card-hover flex flex-col justify-between ${
                isTop1
                  ? 'glass-card border-2 border-amber-400/80 bg-gradient-to-b from-amber-950/30 via-purple-950/40 to-black/60 shadow-xl shadow-amber-500/10'
                  : 'glass-card border border-purple-500/30 bg-purple-950/20'
              }`}
            >
              {/* Badge */}
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1 shadow-sm ${
                    rec.rank === 1
                      ? 'bg-amber-400 text-black shadow-amber-500/50'
                      : rec.rank === 2
                      ? 'bg-purple-300 text-purple-950'
                      : 'bg-purple-900/80 text-purple-200 border border-purple-500/30'
                  }`}
                >
                  {rec.rank === 1 && <Crown className="w-3.5 h-3.5 fill-black" />}
                  <span>TOP {rec.rank}</span>
                </span>

                <div className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  <Sparkles className="w-3 h-3" />
                  <span>{rec.match_percentage}% 참석</span>
                </div>
              </div>

              {/* Date Info */}
              <div className="my-2">
                <h4 className="text-lg font-black text-white">
                  {formatKoreanDate(rec.date)}
                </h4>
                {rec.time_slot && (
                  <p className="text-xs font-bold text-amber-300 mt-0.5">
                    [{rec.time_slot}]
                  </p>
                )}
                <p className="text-xs text-purple-200/90 mt-1">
                  가능 인원: <span className="font-bold text-emerald-300">{rec.possible_count}명</span> / 총 {rec.total_voters}명
                </p>
              </div>

              {/* Attendee / Absentee detail */}
              <div className="my-3 py-2.5 px-3 rounded-xl bg-black/40 border border-purple-500/10 space-y-1.5 text-xs">
                <div className="flex items-start gap-1 text-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span className="font-medium line-clamp-2">
                    {rec.attendee_names.length > 0 ? rec.attendee_names.join(', ') : '가능 인원 없음'}
                  </span>
                </div>

                {rec.absentee_list.length > 0 && (
                  <div className="flex items-start gap-1 text-rose-400">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span className="font-medium">
                      불참: {rec.absentee_list.map((a) => `${a.nickname}${a.note ? `(${a.note})` : ''}`).join(', ')}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Button */}
              {onConfirmDate && (
                <button
                  type="button"
                  onClick={() => {
                    if (isTop1) triggerConfetti();
                    onConfirmDate(rec.date, rec.time_slot);
                  }}
                  className={`w-full mt-2 py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all shadow-md ${
                    isConfirmed
                      ? 'bg-emerald-500 text-black border border-emerald-300 shadow-emerald-500/40'
                      : isTop1
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:from-amber-400 hover:to-amber-500 border border-amber-300'
                      : 'bg-purple-900/60 hover:bg-purple-800 text-purple-200 border border-purple-500/30'
                  }`}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>{isConfirmed ? '이 날짜로 모임 확정됨!' : '이 날짜로 모임 확정하기'}</span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
