'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarSelector } from '@/components/ui/CalendarSelector';
import { AdBanner } from '@/components/ui/Monetization/AdBanner';
import { createRoomMock } from '@/lib/mockStore';
import { ScheduleType } from '@/types/schema';
import { Sparkles, Calendar, Zap, ShieldCheck, ArrowRight, Layers, Users } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scheduleType, setScheduleType] = useState<ScheduleType>('date_only');
  const [selectedDates, setSelectedDates] = useState<string[]>([
    '2026-07-26',
    '2026-07-27',
    '2026-07-28',
    '2026-07-31',
    '2026-08-01',
    '2026-08-02',
  ]);
  const [timeSlots, setTimeSlots] = useState<string[]>([
    '오전 (10:00 ~ 14:00)',
    '오후 (14:00 ~ 18:00)',
    '저녁 (18:00 ~ 22:00)',
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('모임 제목을 입력해 주세요.');
      return;
    }
    if (selectedDates.length === 0) {
      alert('최소 1개 이상의 후보 날짜를 선택해 주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      const room = createRoomMock({
        title: title.trim(),
        description: description.trim(),
        schedule_type: scheduleType,
        candidate_dates: selectedDates,
        time_slots: scheduleType === 'date_time' ? timeSlots : [],
      });

      router.push(`/room/${room.id}`);
    } catch (err) {
      console.error(err);
      alert('방 생성에 실패했습니다. 다시 시도해 주세요.');
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header / Brand Navigation */}
      <header className="flex items-center justify-between py-2 border-b border-purple-500/20">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl gradient-button flex items-center justify-center text-white shadow-lg shadow-purple-500/30">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-1.5">
              <span>모여잇</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Moyeoit v1.0
              </span>
            </h1>
            <p className="text-[11px] text-purple-300/80 font-medium">로그인 0초 • 5초 날짜 조율기</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.push('/room/demo-room-1')}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-purple-950/60 text-purple-200 border border-purple-500/30 hover:bg-purple-900/80 transition-all flex items-center gap-1"
          >
            <span>시연 방 보기</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="text-center space-y-4 py-4">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full glass-card border-purple-500/30 text-xs font-bold text-amber-300 shadow-md">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>카톡 투표보다 10배 빠르고, When2meet보다 10배 예쁜</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
          약속 날짜 조율, <br className="sm:hidden" />
          <span className="gradient-text">5초 만에 모여잇!</span>
        </h2>

        <p className="text-sm sm:text-base text-purple-200/90 max-w-xl mx-auto font-medium">
          로그인 없이 달력 클릭 몇 번으로 방을 만들고, 카톡 단톡방에 공유하세요. <br />
          전원 참석 가능한 <strong className="text-amber-300">황금 날짜 TOP 3</strong>를 자동으로 찾아줍니다.
        </p>

        {/* Feature Badges */}
        <div className="grid grid-cols-3 gap-2 max-w-md mx-auto pt-2">
          <div className="p-2.5 rounded-xl glass-card text-center border-purple-500/20">
            <Zap className="w-4 h-4 text-amber-400 mx-auto mb-1" />
            <p className="text-[11px] font-bold text-white">로그인 0초</p>
            <p className="text-[10px] text-purple-300">회원가입 없음</p>
          </div>
          <div className="p-2.5 rounded-xl glass-card text-center border-purple-500/20">
            <Layers className="w-4 h-4 text-purple-400 mx-auto mb-1" />
            <p className="text-[11px] font-bold text-white">컬러 히트맵</p>
            <p className="text-[10px] text-purple-300">참석률 시각화</p>
          </div>
          <div className="p-2.5 rounded-xl glass-card text-center border-purple-500/20">
            <ShieldCheck className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
            <p className="text-[11px] font-bold text-white">비밀번호 수정</p>
            <p className="text-[10px] text-purple-300">본인 투표 관리</p>
          </div>
        </div>
      </section>

      {/* Main Room Creation Form */}
      <section>
        <form onSubmit={handleCreateRoom} className="glass-card rounded-3xl p-6 sm:p-8 border border-purple-500/30 space-y-6 shadow-2xl">
          <div className="space-y-1">
            <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-400" />
              <span>새로운 모임 방 만들기</span>
            </h3>
            <p className="text-xs text-purple-300">
              후보 날짜와 모임 이름을 정하고 5초 만에 초대 링크를 생성하세요.
            </p>
          </div>

          {/* Title and Description */}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-purple-300 block mb-1">
                모임 제목 <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 7월 정기 구글 스터디 모임 / 주말 파티룸 모임"
                className="w-full px-4 py-3 rounded-xl bg-purple-950/40 border border-purple-500/30 text-white text-sm font-semibold placeholder:text-gray-500 focus:outline-none focus:border-purple-400 transition-all shadow-inner"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-purple-300 block mb-1">
                모임 설명 / 한줄 안내 <span className="text-purple-400/60">(선택)</span>
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="예: 가장 인원 많이 올 수 있는 날짜로 정합시다!"
                className="w-full px-4 py-3 rounded-xl bg-purple-950/40 border border-purple-500/30 text-white text-sm font-semibold placeholder:text-gray-500 focus:outline-none focus:border-purple-400 transition-all shadow-inner"
              />
            </div>
          </div>

          {/* Calendar Candidate Picker */}
          <div>
            <label className="text-xs font-semibold text-purple-300 block mb-2">
              후보 날짜 선택 <span className="text-rose-400">*</span>
            </label>
            <CalendarSelector
              selectedDates={selectedDates}
              onChangeSelectedDates={setSelectedDates}
              scheduleType={scheduleType}
              onChangeScheduleType={setScheduleType}
              timeSlots={timeSlots}
              onChangeTimeSlots={setTimeSlots}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 rounded-2xl gradient-button text-white font-black text-base shadow-2xl flex items-center justify-center gap-2 transform active:scale-95 transition-all cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-5 h-5 text-amber-300" />
            <span>{isSubmitting ? '모임 방 생성 중...' : '⚡ 5초 만에 약속 방 만들기'}</span>
          </button>
        </form>
      </section>

      {/* Demo Rooms Shortcuts */}
      <section className="glass-card rounded-2xl p-5 border border-purple-500/20 space-y-3">
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <Users className="w-4 h-4 text-amber-400" />
          <span>실시간 모임 시연 미리보기</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => router.push('/room/demo-room-1')}
            className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/20 hover:border-purple-400/50 text-left transition-all group"
          >
            <p className="text-xs font-extrabold text-white group-hover:text-purple-300">
              🎉 7월 모여잇 정기 스터디 모임
            </p>
            <p className="text-[11px] text-purple-300/70 mt-0.5">
              날짜 전용 조율 • 3명 투표 완료 (히트맵 테스트)
            </p>
          </button>

          <button
            type="button"
            onClick={() => router.push('/room/demo-room-2')}
            className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/20 hover:border-purple-400/50 text-left transition-all group"
          >
            <p className="text-xs font-extrabold text-white group-hover:text-purple-300">
              ☕ 주말 파티룸 모임 (시간대 지정)
            </p>
            <p className="text-[11px] text-purple-300/70 mt-0.5">
              날짜 + 오전/오후/저녁 시간대 조율 샘플
            </p>
          </button>
        </div>
      </section>

      {/* Display Ad Slot */}
      <AdBanner slotType="bottom_vote" />

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-purple-400/60 border-t border-purple-500/10 space-y-1">
        <p>© 2026 모여잇 (Moyeoit) • 5초 날짜 조율기</p>
        <p className="text-[11px]">Next.js 14 • Supabase Realtime • 모바일 최적화 웹 서비스</p>
      </footer>
    </main>
  );
}
