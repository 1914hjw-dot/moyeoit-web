'use client';

import React from 'react';
import { Room, Vote } from '@/types/schema';
import { formatKoreanDate } from '@/lib/analytics';
import { MultiShareButton } from '@/components/ui/MultiShareButton';
import { PartyPopper, CalendarCheck, Users, Sparkles } from 'lucide-react';

interface ConfirmedResultCardProps {
  room: Room;
  votes: Vote[];
  shareUrl: string;
}

export const ConfirmedResultCard: React.FC<ConfirmedResultCardProps> = ({
  room,
  votes,
  shareUrl,
}) => {
  const confirmedDateStr = room.confirmed_date ? formatKoreanDate(room.confirmed_date) : '';
  const totalVoters = votes.length;

  // Calculate attendees for confirmed date
  const confirmedAttendees = room.confirmed_date
    ? votes.filter((v) => v.availability[room.confirmed_date!] === 'possible').map((v) => v.nickname)
    : [];

  return (
    <section className="sys-card p-6 sm:p-10 space-y-6 bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white rounded-3xl shadow-2xl border border-indigo-700/50 text-center relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute -top-24 -left-24 w-60 h-60 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-60 h-60 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-4">
        {/* Celebration Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-black tracking-wide shadow-sm">
          <PartyPopper className="w-4 h-4 text-emerald-400" />
          <span>모임 일정 최종 확정 완료!</span>
        </div>

        {/* Title */}
        <h2 className="text-xl sm:text-2xl font-black text-indigo-100 tracking-tight">
          {room.title}
        </h2>

        {/* Formatted Confirmed Date Card */}
        <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 max-w-lg mx-auto space-y-2 shadow-inner">
          <div className="flex items-center justify-center gap-2 text-indigo-300 text-xs font-bold">
            <CalendarCheck className="w-4 h-4 text-emerald-400" />
            <span>최종 약속 일시</span>
          </div>
          <p className="text-2xl sm:text-4xl font-black text-white tracking-tight drop-shadow-sm">
            {confirmedDateStr}
          </p>
          <div className="flex items-center justify-center gap-1.5 pt-2 text-xs font-extrabold text-indigo-200">
            <Users className="w-4 h-4 text-indigo-400" />
            <span>
              참여 가능: {confirmedAttendees.length}명 / 전체 {totalVoters}명
            </span>
          </div>
        </div>

        {/* Attendee Names Pill Cloud */}
        {confirmedAttendees.length > 0 && (
          <div className="space-y-2 max-w-md mx-auto">
            <p className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider">
              참석 가능 확정자 ({confirmedAttendees.length}명)
            </p>
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              {confirmedAttendees.map((name, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-bold"
                >
                  ✓ {name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Multi-Layer Share Action Button */}
        <div className="pt-4 max-w-xs mx-auto">
          <MultiShareButton
            title={room.title}
            description={`🎉 ${confirmedDateStr}에 약속이 확정되었습니다!`}
            url={shareUrl}
            confirmedDate={confirmedDateStr}
            className="w-full h-12 shadow-lg shadow-indigo-500/30"
          />
        </div>
      </div>
    </section>
  );
};
