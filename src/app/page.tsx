'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarSelector } from '@/components/ui/CalendarSelector';
import { trackRoomCreateStart, trackRoomCreated } from '@/lib/gtag';
import { AdFitBanner } from '@/components/ads';
import { HomeBelowTheFold } from '@/components/ui/HomeBelowTheFold';
import { Footer } from '@/components/ui/Footer';
import { NoticeBanner } from '@/components/ui/NoticeBanner';
import { ScheduleType, DateSelectionMode } from '@/types/schema';
import { Sparkles, Calendar, ArrowRight } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scheduleType, setScheduleType] = useState<ScheduleType>('date_only');
  const [dateSelectionMode, setDateSelectionMode] = useState<DateSelectionMode>('RANGE');
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
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

    // In RANGE mode, require at least 1 candidate date.
    // In FREE mode, candidate_dates can be empty on room creation.
    if (dateSelectionMode === 'RANGE' && selectedDates.length === 0) {
      alert('기간 지정 모드에서는 최소 1개 이상의 후보 날짜를 선택해 주세요.');
      return;
    }
    
    trackRoomCreateStart(dateSelectionMode);
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          schedule_type: dateSelectionMode === 'FREE' ? 'date_only' : scheduleType,
          candidate_dates: dateSelectionMode === 'FREE' ? selectedDates : selectedDates,
          time_slots: scheduleType === 'date_time' && dateSelectionMode !== 'FREE' ? timeSlots : [],
          date_selection_mode: dateSelectionMode,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || '방 생성에 실패했습니다. 다시 시도해 주세요.');
      }

      trackRoomCreated(dateSelectionMode);
      const publicUrlId = data.room.legacy_slug || data.room.id;

      if (typeof window !== 'undefined') {
        if (data.room.host_secret) {
          localStorage.setItem(`moyeoit_host_secret_${data.room.id}`, data.room.host_secret);
          if (data.room.legacy_slug) {
            localStorage.setItem(`moyeoit_host_secret_${data.room.legacy_slug}`, data.room.host_secret);
          }
        }
        localStorage.setItem(`moyeoit_host_${data.room.id}`, 'true');
        if (data.room.legacy_slug) {
          localStorage.setItem(`moyeoit_host_${data.room.legacy_slug}`, 'true');
        }
      }

      router.push(`/room/${publicUrlId}`);
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : '방 생성에 실패했습니다. 다시 시도해 주세요.');
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen max-w-4xl mx-auto px-4 py-4 space-y-6 flex flex-col justify-between">
      <div className="space-y-6">
        {/* Brand Header */}
        <header className="flex items-center justify-between py-2 border-b border-slate-200/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black shadow-sm">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 flex items-center gap-2">
                <span>모여잇</span>
                <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  Moyeoit
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => router.push('/room/demo-room-1')}
              className="px-3.5 py-1.5 rounded-2xl text-xs font-extrabold bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 transition-all flex items-center gap-1 cursor-pointer shadow-sm"
            >
              <span>시연 모임방</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            </button>
          </div>
        </header>

        {/* Unobtrusive Pinned Notice Banner (Failure-isolated) */}
        <NoticeBanner />

        {/* Compact Hero Section */}
        <section className="text-center space-y-2.5 pt-2 pb-1">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-extrabold text-slate-700 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>회원가입 없이 • 단톡방 링크로 공유</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900">
            친구들과 가능한 날짜를 모아 약속을 확정해요.
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
            기간 지정과 자유 날짜 선택 2가지 모드를 지원하며, 가장 많은 인원이 참석 가능한 황금 날짜를 자동으로 찾아 드립니다.
          </p>
        </section>

        {/* Main Room Creation Form Section */}
        <section>
          <form onSubmit={handleCreateRoom} className="sys-card p-5 sm:p-8 space-y-6 shadow-xl shadow-slate-200/50 border-slate-200/80 bg-white">
            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-slate-800" />
                <span>새로운 약속 방 만들기</span>
              </h3>
              <p className="text-xs text-slate-500">
                모임 이름과 날짜 선택 방식을 정하고 단톡방 초대 링크를 발급받으세요.
              </p>
            </div>

            {/* Inputs */}
            <div className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  모임 제목 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="예: 8월 정기 스터디 / 주말 여행 모임"
                  className="w-full sys-input h-11 text-xs sm:text-sm font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  한줄 메모 / 안내 <span className="text-slate-400 font-normal">(선택)</span>
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
              <label className="text-xs font-bold text-slate-700 block mb-2">
                후보 날짜 지정 방식 <span className="text-rose-500">*</span>
              </label>
              <CalendarSelector
                selectedDates={selectedDates}
                onChangeSelectedDates={setSelectedDates}
                scheduleType={scheduleType}
                onChangeScheduleType={setScheduleType}
                timeSlots={timeSlots}
                onChangeTimeSlots={setTimeSlots}
                dateSelectionMode={dateSelectionMode}
                onChangeDateSelectionMode={setDateSelectionMode}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sys-btn-primary h-13 text-sm font-black flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-md"
            >
              <Sparkles className="w-4 h-4 text-white" />
              <span>{isSubmitting ? '약속 방 생성 중...' : '약속 방 만들기 (초대 링크 생성)'}</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>
          </form>
        </section>

        {/* Demo Rooms Shortcuts */}
        <section className="sys-card p-5 space-y-3 bg-white border-slate-200/80 shadow-sm">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            시연 모임방 미리보기
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => router.push('/room/demo-room-1')}
              className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-slate-400 hover:bg-slate-100 text-left transition-all group cursor-pointer"
            >
              <p className="text-xs font-black text-slate-900 group-hover:text-slate-900">
                7월 모여잇 정기 스터디 모임
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                날짜 전용 조율 • 3명 투표 완료 (히트맵 테스트)
              </p>
            </button>

            <button
              type="button"
              onClick={() => router.push('/room/demo-room-2')}
              className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-slate-400 hover:bg-slate-100 text-left transition-all group cursor-pointer"
            >
              <p className="text-xs font-black text-slate-900 group-hover:text-slate-900">
                주말 파티룸 모임 (시간대 지정)
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                날짜 + 오전/오후/저녁 시간대 조율 샘플
              </p>
            </button>
          </div>
        </section>

        {/* Rich Below-the-Fold Content & FAQ */}
        <HomeBelowTheFold />

        {/* Paid promotion stays after the site's own tools and editorial content. */}
        <AdFitBanner />
      </div>

      <Footer />
    </main>
  );
}
