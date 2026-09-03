'use client';

import React from 'react';
import { Crown, Sparkles, CheckCircle2, AlertCircle, ThumbsUp, ShieldCheck, Users, Share2, Info } from 'lucide-react';
import { HeatmapCellData } from '@/types/schema';
import { evaluateDecision, formatKoreanDate } from '@/lib/analytics';

interface GoldenDateCardProps {
  heatmapData: Record<string, HeatmapCellData>;
  totalVoters: number;
  onConfirmDate?: (dateKey: string) => void;
  onShare?: () => void;
  selectedConfirmedKey?: string;
  isHost?: boolean;
}

export const GoldenDateCard: React.FC<GoldenDateCardProps> = ({
  heatmapData,
  totalVoters,
  onConfirmDate,
  onShare,
  selectedConfirmedKey,
  isHost = false,
}) => {
  const decision = evaluateDecision(heatmapData, totalVoters);

  if (!decision.hasVoters || decision.topCandidates.length === 0) {
    return (
      <div className="w-full sys-card p-6 text-center space-y-3 border-dashed border-slate-200 my-4 bg-white">
        <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
          <Users className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-extrabold text-slate-900">아직 다른 참여자의 응답이 없어요</h4>
          <p className="text-xs text-slate-500">
            친구들에게 링크를 공유하면 전원 참석 가능한 황금 날짜를 10초 만에 찾아드려요!
          </p>
        </div>
        {onShare && (
          <button
            type="button"
            onClick={onShare}
            className="px-4 py-2.5 rounded-2xl bg-slate-900 text-white font-black text-xs inline-flex items-center gap-1.5 shadow-md cursor-pointer hover:bg-slate-800 transition-all"
          >
            <Share2 className="w-3.5 h-3.5 fill-white" />
            <span>친구들에게 초대 링크 전달하기</span>
          </button>
        )}
      </div>
    );
  }

  const { decisionType, topCandidates, runnerUpCandidates } = decision;
  const isAllAvailable = decisionType === 'ALL_AVAILABLE';
  const isTie = topCandidates.length > 1;

  // Dynamic import of canvas-confetti
  const triggerConfetti = async () => {
    try {
      const confettiModule = await import('canvas-confetti');
      const confetti = confettiModule.default;
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#10b981', '#34d399', '#059669'],
      });
    } catch {
      // Ignore
    }
  };

  const formatAttendeeNames = (names: string[]): string => {
    if (names.length === 0) return '가능 인원 없음';
    if (names.length <= 3) return names.join(' · ');
    return `${names.slice(0, 3).join(' · ')} 외 ${names.length - 3}명`;
  };

  return (
    <div className="w-full space-y-4 my-4">
      {/* Header Banner */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Crown className="w-4 h-4 text-emerald-600 fill-emerald-600" />
          <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
            {isAllAvailable ? '🎉 전원 참석 가능한 황금 날짜' : '🥇 가장 많은 사람이 가능한 날짜'}
          </h3>
        </div>
        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
          {isAllAvailable ? '100% 참석 가능' : '최다 참석 추천'}
        </span>
      </div>

      {/* Top 1st Place Candidates (Handles Equal Ties!) */}
      <div className="space-y-3">
        {topCandidates.map((cand) => {
          const isConfirmed = selectedConfirmedKey === cand.key;
          const displayDate = cand.time_slot ? `${formatKoreanDate(cand.date)} [${cand.time_slot}]` : formatKoreanDate(cand.date);

          return (
            <div
              key={cand.key}
              className={`relative rounded-3xl p-6 transition-all ${
                isConfirmed
                  ? 'bg-emerald-50/90 border-2 border-emerald-500 shadow-lg shadow-emerald-500/10'
                  : 'bg-emerald-50/50 border-2 border-emerald-200/90 shadow-md shadow-emerald-500/5'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="px-3 py-0.5 rounded-full text-xs font-black bg-emerald-600 text-white uppercase tracking-wider shadow-sm">
                  {isAllAvailable ? '전원 가능 (100%)' : isTie ? '공동 1위 추천' : '1위 최적 날짜'}
                </span>
                <span className="text-xs font-extrabold text-emerald-700 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  {cand.possible_count}명 /전체 {cand.total_voters}명 가능
                </span>
              </div>

              <div className="my-3">
                <h4 className="text-xl sm:text-2xl font-black text-slate-900">
                  {displayDate}
                </h4>
              </div>

              {/* Attendee Names Breakdown */}
              <div className="p-3.5 rounded-2xl bg-white/90 border border-slate-200/80 space-y-1.5 text-xs mb-4 shadow-xs">
                <div className="flex items-start gap-1.5 text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-600" />
                  <span className="font-bold text-slate-800">
                    참석 가능 ({cand.possible_count}명): {formatAttendeeNames(cand.attendee_names)}
                  </span>
                </div>

                {cand.absentee_list.length > 0 && (
                  <div className="flex items-start gap-1.5 text-rose-600">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-500" />
                    <span className="font-semibold text-slate-500">
                      불참/미정: {cand.absentee_list.map((a) => a.nickname).slice(0, 3).join(' · ')}
                      {cand.absentee_list.length > 3 ? ` 외 ${cand.absentee_list.length - 3}명` : ''}
                    </span>
                  </div>
                )}
              </div>

              {/* Role-based Host Confirm Action Button */}
              {isHost && onConfirmDate ? (
                <button
                  type="button"
                  onClick={() => {
                    triggerConfetti();
                    onConfirmDate(cand.key);
                  }}
                  className={`w-full py-3.5 rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
                    isConfirmed
                      ? 'bg-emerald-600 text-white shadow-emerald-600/20'
                      : 'sys-btn-primary'
                  }`}
                >
                  <ThumbsUp className="w-4 h-4 text-white" />
                  <span>{isConfirmed ? '이 날짜로 약속 확정 완료' : `방장: ${displayDate}(으)로 모임 확정하기`}</span>
                </button>
              ) : isConfirmed ? (
                <div className="w-full py-3.5 rounded-2xl text-xs font-black bg-emerald-600 text-white flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20">
                  <ShieldCheck className="w-4 h-4 text-white" />
                  <span>방장에 의해 이 날짜로 모임이 확정되었습니다.</span>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {/* Runner Up Candidates (2nd & 3rd place) */}
      {runnerUpCandidates.length > 0 && (
        <div className="space-y-2 pt-1">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">차선책 추천 날짜</p>
          {runnerUpCandidates.map((cand) => {
            const isConfirmed = selectedConfirmedKey === cand.key;
            const displayDate = cand.time_slot ? `${formatKoreanDate(cand.date)} [${cand.time_slot}]` : formatKoreanDate(cand.date);

            return (
              <div
                key={cand.key}
                className="p-3.5 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-between gap-3 text-xs shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-black text-xs">
                    {cand.rank}위
                  </span>
                  <div>
                    <span className="font-extrabold text-slate-900">{displayDate}</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      가능: {formatAttendeeNames(cand.attendee_names)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-slate-500 font-semibold text-[11px]">
                    <strong className="text-emerald-600 font-extrabold">{cand.possible_count}명</strong> / {cand.total_voters}명
                  </span>

                  {isHost && onConfirmDate && (
                    <button
                      type="button"
                      onClick={() => onConfirmDate(cand.key)}
                      className={`px-3 py-1 rounded-xl text-[11px] font-extrabold transition-all cursor-pointer ${
                        isConfirmed
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {isConfirmed ? '확정됨' : '확정하기'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* System Rule Info */}
      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-2 text-[11px] text-slate-600 leading-relaxed shadow-sm">
        <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <div>
          <strong className="font-extrabold text-slate-900">추천 판정 규칙:</strong>
          <span> 전원 참석 가능한 날짜(`100%`)가 존재하면 최우선 추천되며, 동률인 경우 모든 1위 후보를 공동 추천하여 방장이 자유롭게 선택할 수 있습니다.</span>
        </div>
      </div>
    </div>
  );
};
