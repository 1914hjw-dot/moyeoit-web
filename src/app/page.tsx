'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarSelector } from '@/components/ui/CalendarSelector';
import { AdBanner } from '@/components/ui/Monetization/AdBanner';
import { Footer } from '@/components/ui/Footer';
import { ScheduleType } from '@/types/schema';
import { Sparkles, Calendar, ArrowRight } from 'lucide-react';

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

  const handleCreateRoom = async (e: React.FormEvent) => {
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
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          schedule_type: scheduleType,
          candidate_dates: selectedDates,
          time_slots: scheduleType === 'date_time' ? timeSlots : [],
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || '방 생성에 실패했습니다. 다시 시도해 주세요.');
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem(`moyeoit_host_${data.room.id}`, 'true');
      }

      router.push(`/room/${data.room.id}`);
    } catch (err: any) {
      console.error(err);
      alert(err.message || '방 생성에 실패했습니다. 다시 시도해 주세요.');
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen max-w-4xl mx-auto px-4 py-4 space-y-6 flex flex-col justify-between">
      <div className="space-y-6">
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
              className="px-3 py-1 rounded-xl text-xs font-bold bg-zinc-900 text-zinc-300 border border-zinc-800 hover:bg-zinc-800 transition-all flex items-center gap-1 cursor-pointer"
            >
              <span>시연 모임방</span>
              <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
            </button>
          </div>
        </header>

        {/* Compact Hero Section */}
        <section className="text-center space-y-2 pt-1 pb-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-semibold text-zinc-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>회원가입 0초 • 단톡방 링크 1초 공유</span>
          </div>

          <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight text-zinc-100">
            약속 날짜, 모여잇으로 10초 만에 정해요.
          </h2>
        </section>

        {/* Main Room Creation Form Section - ABOVE THE FOLD FOCUS */}
        <section>
          <form onSubmit={handleCreateRoom} className="sys-card p-5 sm:p-7 space-y-5 shadow-2xl border-zinc-800">
            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-extrabold text-zinc-100 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-400" />
                <span>새로운 약속 방 만들기</span>
              </h3>
              <p className="text-xs text-zinc-400">
                모임 이름과 후보 날짜를 정하고 초대 링크를 만드세요.
              </p>
            </div>

            {/* Inputs */}
            <div className="space-y-3">
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
                  className="w-full sys-input h-11 text-xs"
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
                  className="w-full sys-input h-11 text-xs"
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
              className="w-full sys-btn-primary h-12 text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-lg"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSubmitting ? '약속 방 생성 중...' : '약속 방 만들기 (링크 생성)'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </section>

        {/* Core 3-Step Workflow Flow */}
        <section className="space-y-3 pt-2">
          <div className="text-center space-y-0.5">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Workflow</h3>
            <p className="text-xs font-bold text-zinc-200">약속이 정해지는 가장 자연스러운 3단계</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="sys-card p-4 space-y-1.5 border-zinc-800">
              <span className="text-[11px] font-black text-indigo-400 tracking-wider">01</span>
              <h4 className="text-xs font-bold text-zinc-100">10초 만에 방 만들기</h4>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                로그인 없이 모임 이름과 후보 날짜를 지정합니다.
              </p>
            </div>

            <div className="sys-card p-4 space-y-1.5 border-zinc-800">
              <span className="text-[11px] font-black text-indigo-400 tracking-wider">02</span>
              <h4 className="text-xs font-bold text-zinc-100">단톡방에 1초 공유</h4>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                카카오톡에 초대 링크를 공유하면 예쁜 카드가 전달됩니다.
              </p>
            </div>

            <div className="sys-card p-4 space-y-1.5 border-zinc-800">
              <span className="text-[11px] font-black text-indigo-400 tracking-wider">03</span>
              <h4 className="text-xs font-bold text-zinc-100">황금 날짜 한눈에 확인</h4>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                전원 참석 가능한 TOP 1 날짜와 히트맵으로 확정합니다.
              </p>
            </div>
          </div>
        </section>

        {/* Demo Rooms Shortcuts */}
        <section className="sys-card p-4 space-y-2 border-zinc-800">
          <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
            시연 모임방 미리보기
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => router.push('/room/demo-room-1')}
              className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-left transition-all group cursor-pointer"
            >
              <p className="text-xs font-extrabold text-zinc-200 group-hover:text-white">
                🎉 7월 모여잇 정기 스터디 모임
              </p>
              <p className="text-[10px] text-zinc-500 mt-0.5">
                날짜 전용 조율 • 3명 투표 완료 (히트맵 테스트)
              </p>
            </button>

            <button
              type="button"
              onClick={() => router.push('/room/demo-room-2')}
              className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-left transition-all group cursor-pointer"
            >
              <p className="text-xs font-extrabold text-zinc-200 group-hover:text-white">
                ☕ 주말 파티룸 모임 (시간대 지정)
              </p>
              <p className="text-[10px] text-zinc-500 mt-0.5">
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
