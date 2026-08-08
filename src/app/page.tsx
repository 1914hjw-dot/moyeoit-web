'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarSelector } from '@/components/ui/CalendarSelector';
import { AdFitBanner } from '@/components/ads';
import { HomeBelowTheFold } from '@/components/ui/HomeBelowTheFold';
import { Footer } from '@/components/ui/Footer';
import { ScheduleType, DateSelectionMode } from '@/types/schema';
import { Sparkles, Calendar, ArrowRight, CheckCircle2, Globe, ThumbsUp, Share2 } from 'lucide-react';

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

      const publicUrlId = data.room.legacy_slug || data.room.id;

      if (typeof window !== 'undefined') {
        if (data.room.secret_hash) {
          localStorage.setItem(`moyeoit_host_secret_${data.room.id}`, data.room.secret_hash);
          if (data.room.legacy_slug) {
            localStorage.setItem(`moyeoit_host_secret_${data.room.legacy_slug}`, data.room.secret_hash);
          }
        }
        localStorage.setItem(`moyeoit_host_${data.room.id}`, 'true');
        if (data.room.legacy_slug) {
          localStorage.setItem(`moyeoit_host_${data.room.legacy_slug}`, 'true');
        }
      }

      router.push(`/room/${publicUrlId}`);
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

        {/* Compact Hero Section */}
        <section className="text-center space-y-2.5 pt-2 pb-1">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-extrabold text-slate-700 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>회원가입 0초 • 단톡방 링크 1초 공유</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900">
            친구들과 약속 날짜, 10초 만에 조율하고 확정해요.
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
            방장이 날짜를 지정하거나 참여자가 자유롭게 선택하는 2가지 모드 지원! 전원 참석 가능한 황금 날짜를 자동 계산하고 최종 모임 일정을 확정해 드립니다.
          </p>
        </section>

        {/* Feature Banner Bar: 2가지 날짜 선택 방식 안내 */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-1">
            <div className="flex items-center gap-1.5 font-extrabold text-indigo-950 text-xs sm:text-sm">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <span>1. 기간 내에서 선택</span>
            </div>
            <p className="text-[11px] text-indigo-800 leading-relaxed">
              방장이 지정한 후보 기간 안에서 참여자들이 참석 가능한 날짜를 투표합니다.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 space-y-1">
            <div className="flex items-center gap-1.5 font-extrabold text-emerald-950 text-xs sm:text-sm">
              <Globe className="w-4 h-4 text-emerald-600" />
              <span>2. 자유 날짜 선택</span>
            </div>
            <p className="text-[11px] text-emerald-800 leading-relaxed">
              방장이 후보 날짜를 정하지 않고, 참여자들이 각자 가능한 날짜를 자유롭게 선택합니다.
            </p>
          </div>
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

        {/* Kakao AdFit Banner (Placed directly below Room Creation Section) */}
        <AdFitBanner />

        {/* Core 6-Step Workflow Section */}
        <section className="space-y-3 pt-2">
          <div className="text-center space-y-0.5">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Workflow</h3>
            <p className="text-sm font-black text-slate-900">모여잇은 이렇게 작동합니다 (6단계 흐름)</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <div className="sys-card p-4 space-y-1.5 bg-white border-slate-200/80 shadow-xs">
              <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center text-xs font-black">01</span>
              <h4 className="text-xs font-black text-slate-900">10초 방 만들기</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">로그인 없이 방 제목과 날짜 방식을 지정합니다.</p>
            </div>

            <div className="sys-card p-4 space-y-1.5 bg-white border-slate-200/80 shadow-xs">
              <span className="w-6 h-6 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center text-xs font-black">02</span>
              <h4 className="text-xs font-black text-slate-900">1초 링크 공유</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">카카오톡 단톡방이나 메시지로 링크를 배포합니다.</p>
            </div>

            <div className="sys-card p-4 space-y-1.5 bg-white border-slate-200/80 shadow-xs">
              <span className="w-6 h-6 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center text-xs font-black">03</span>
              <h4 className="text-xs font-black text-slate-900">가능 날짜 투표</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">참여자가 본인 닉네임으로 5초 만에 응답합니다.</p>
            </div>

            <div className="sys-card p-4 space-y-1.5 bg-white border-slate-200/80 shadow-xs">
              <span className="w-6 h-6 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-100 flex items-center justify-center text-xs font-black">04</span>
              <h4 className="text-xs font-black text-slate-900">황금 날짜 자동 산정</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">전원 참석(100%) 또는 최다 가능 날짜를 찾습니다.</p>
            </div>

            <div className="sys-card p-4 space-y-1.5 bg-white border-slate-200/80 shadow-xs">
              <span className="w-6 h-6 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-100 flex items-center justify-center text-xs font-black">05</span>
              <h4 className="text-xs font-black text-slate-900">방장 날짜 확정</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">방장이 1위 황금 날짜 중 1개를 선택하여 확정합니다.</p>
            </div>

            <div className="sys-card p-4 space-y-1.5 bg-white border-slate-200/80 shadow-xs">
              <span className="w-6 h-6 rounded-xl bg-indigo-50 text-indigo-800 border border-indigo-100 flex items-center justify-center text-xs font-black">06</span>
              <h4 className="text-xs font-black text-slate-900">확정 결과 공유</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">확정 축하 카드와 결과를 단톡방에 재공유합니다.</p>
            </div>
          </div>
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
      </div>

      <Footer />
    </main>
  );
}
