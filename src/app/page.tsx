'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarSelector } from '@/components/ui/CalendarSelector';
import { AdBanner } from '@/components/ui/Monetization/AdBanner';
import { Footer } from '@/components/ui/Footer';
import { createRoomMock } from '@/lib/mockStore';
import { ScheduleType } from '@/types/schema';
import { Sparkles, Calendar, ArrowRight, CheckCircle2, ShieldCheck, Share2, Layers } from 'lucide-react';

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
    '오전 (10:00~14:00)',
    '오후 (14:00~18:00)',
    '저녁 (18:00~22:00)',
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
    <main className="min-h-screen max-w-4xl mx-auto px-4 py-8 space-y-12 flex flex-col justify-between">
      <div className="space-y-12">
        {/* Brand Header */}
        <header className="flex items-center justify-between py-2 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-zinc-100 text-zinc-950 flex items-center justify-center font-bold">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-base font-extrabold tracking-tight text-zinc-100 flex items-center gap-2">
                <span>모여잇</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700/50">
                  Moyeoit
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => router.push('/room/demo-room-1')}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-zinc-900 text-zinc-300 border border-zinc-800 hover:bg-zinc-800 transition-all flex items-center gap-1"
            >
              <span>실시간 시연 방</span>
              <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
            </button>
          </div>
        </header>

        {/* Hero Section - Vercel / Linear Style */}
        <section className="text-center space-y-6 pt-4 pb-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>회원가입 0초 • 복잡한 조율 과정 최소화</span>
          </div>

          <div className="space-y-3">
            <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-zinc-100 leading-[1.15]">
              언제 만날까? <br />
              <span className="text-zinc-400 font-bold">모여잇에서 바로 정해요.</span>
            </h2>

            <p className="text-sm sm:text-base text-zinc-400 max-w-xl mx-auto font-normal leading-relaxed">
              카카오톡 단톡방에 링크만 공유하세요. 전원 참석 가능한 최적의 날짜를 <br className="hidden sm:inline" />
              <strong className="text-zinc-200 font-semibold">황금 날짜 TOP 3와 컬러 히트맵</strong>으로 10초 만에 visual 시각화해 줍니다.
            </p>
          </div>

          {/* Interactive Live Hero Simulation Card */}
          <div className="max-w-md mx-auto pt-2">
            <div className="linear-card p-4 border-zinc-800 bg-zinc-950/80 text-left space-y-3 shadow-xl">
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-zinc-200">🎉 7월 모여잇 정기 모임</span>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-bold">
                    3명 투표 완료
                  </span>
                </div>
                <span className="text-[10px] text-zinc-500">실시간 미리보기</span>
              </div>

              {/* Simulated Heatmap preview */}
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2.5 rounded-lg bg-amber-400 text-zinc-950 border border-amber-300">
                  <span className="text-[10px] font-extrabold block">7월 26일 (일)</span>
                  <div className="flex items-end justify-between mt-1">
                    <span className="text-sm font-black">3/3명</span>
                    <span className="text-[9px] bg-zinc-950 text-amber-300 px-1 rounded font-bold">PERFECT</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <span className="text-[10px] font-bold block">7월 27일 (월)</span>
                  <div className="flex items-end justify-between mt-1">
                    <span className="text-sm font-bold">2/3명</span>
                    <span className="text-[9px]">67%</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-zinc-900 text-zinc-500 border border-zinc-800">
                  <span className="text-[10px] font-semibold block">7월 28일 (화)</span>
                  <div className="flex items-end justify-between mt-1">
                    <span className="text-sm font-bold">1/3명</span>
                    <span className="text-[9px]">33%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Core 3-Step Workflow Flow */}
        <section className="space-y-4">
          <div className="text-center space-y-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Workflow</h3>
            <p className="text-base font-bold text-zinc-200">약속이 정해지는 가장 자연스러운 3단계</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="linear-card p-5 space-y-2 border-zinc-800">
              <span className="text-xs font-black text-indigo-400 tracking-wider">01</span>
              <h4 className="text-sm font-bold text-zinc-100">10초 만에 방 만들기</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                로그인 없이 모임 이름과 후보 날짜를 지정합니다. (주말 1초 선택 지원)
              </p>
            </div>

            <div className="linear-card p-5 space-y-2 border-zinc-800">
              <span className="text-xs font-black text-indigo-400 tracking-wider">02</span>
              <h4 className="text-sm font-bold text-zinc-100">단톡방에 1초 공유</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                카카오톡에 초대 링크를 공유하면 예쁜 투표 썸네일 카드가 자동 전달됩니다.
              </p>
            </div>

            <div className="linear-card p-5 space-y-2 border-zinc-800">
              <span className="text-xs font-black text-indigo-400 tracking-wider">03</span>
              <h4 className="text-sm font-bold text-zinc-100">황금 날짜 한눈에 확인</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                전원 참석 가능한 TOP 3 날짜와 히트맵으로 고민 없이 바로 약속을 확정합니다.
              </p>
            </div>
          </div>
        </section>

        {/* Main Room Creation Form Section */}
        <section>
          <form onSubmit={handleCreateRoom} className="linear-card p-6 sm:p-8 space-y-6">
            <div className="space-y-1">
              <h3 className="text-lg font-extrabold text-zinc-100 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-400" />
                <span>새로운 약속 방 만들기</span>
              </h3>
              <p className="text-xs text-zinc-400">
                후보 날짜를 정하고 초대 링크를 생성하세요.
              </p>
            </div>

            {/* Inputs */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  모임 제목 <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="예: 7월 정기 스터디 / 주말 파티룸 모임"
                  className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm font-semibold placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  한줄 메모 / 안내 <span className="text-zinc-500">(선택)</span>
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="예: 가장 많은 사람이 올 수 있는 날짜로 정해요!"
                  className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm font-semibold placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 transition-all"
                />
              </div>
            </div>

            {/* Calendar Candidate Picker */}
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-2">
                후보 날짜 지정 <span className="text-rose-400">*</span>
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
              className="w-full py-4 rounded-xl v-btn-primary text-sm font-extrabold flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSubmitting ? '약속 방 생성 중...' : '약속 방 만들기'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </section>

        {/* Demo Rooms Shortcuts */}
        <section className="linear-card p-5 space-y-3">
          <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
            시연 모임방 미리보기
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => router.push('/room/demo-room-1')}
              className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-left transition-all group"
            >
              <p className="text-xs font-extrabold text-zinc-200 group-hover:text-white">
                🎉 7월 모여잇 정기 스터디 모임
              </p>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                날짜 전용 조율 • 3명 투표 완료 (히트맵 테스트)
              </p>
            </button>

            <button
              type="button"
              onClick={() => router.push('/room/demo-room-2')}
              className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-left transition-all group"
            >
              <p className="text-xs font-extrabold text-zinc-200 group-hover:text-white">
                ☕ 주말 파티룸 모임 (시간대 지정)
              </p>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                날짜 + 오전/오후/저녁 시간대 조율 샘플
              </p>
            </button>
          </div>
        </section>

        {/* Ad Banner */}
        <AdBanner slotType="bottom_vote" />
      </div>

      <Footer />
    </main>
  );
}
