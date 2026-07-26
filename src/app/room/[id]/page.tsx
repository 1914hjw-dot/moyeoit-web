'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Room, Vote, SubmitVoteInput } from '@/types/schema';
import { computeHeatmapData, extractGoldenDates } from '@/lib/analytics';
import { GoldenDateCard } from '@/components/ui/GoldenDateCard';
import { HeatmapGrid } from '@/components/ui/HeatmapGrid';
import { GuestVoteForm } from '@/components/ui/GuestVoteForm';
import { ShareSheet } from '@/components/ui/ShareSheet';
import { AdBanner } from '@/components/ui/Monetization/AdBanner';
import { AffiliateButtons } from '@/components/ui/Monetization/AffiliateButtons';
import { Footer } from '@/components/ui/Footer';
import {
  LoadingState,
  OfflineState,
  InvalidLinkState,
} from '@/components/ui/StateViews';
import { Share2, Vote as VoteIcon, ArrowLeft, Sparkles, Check, Edit3, Users } from 'lucide-react';

export default function RoomDetailPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params?.id as string;

  const [room, setRoom] = useState<Room | null>(null);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);

  // My vote tracking
  const [myVote, setMyVote] = useState<Vote | null>(null);
  const [showVoteForm, setShowVoteForm] = useState(false);
  const [showShareSheet, setShowShareSheet] = useState(false);

  const [confirmedKey, setConfirmedKey] = useState<string | undefined>(undefined);
  const [confirmedDateInfo, setConfirmedDateInfo] = useState<{ date: string; timeSlot?: string } | null>(null);

  // Network offline listener
  useEffect(() => {
    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => setIsOffline(false);

    if (typeof window !== 'undefined') {
      setIsOffline(!navigator.onLine);
      window.addEventListener('offline', handleOffline);
      window.addEventListener('online', handleOnline);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('offline', handleOffline);
        window.removeEventListener('online', handleOnline);
      }
    };
  }, []);

  const loadRoomData = async () => {
    if (!roomId) return;
    setLoading(true);
    try {
      const roomRes = await fetch(`/api/rooms/${roomId}`);
      const roomData = await roomRes.json();

      if (roomRes.ok && roomData.success && roomData.room) {
        setRoom(roomData.room);

        const votesRes = await fetch(`/api/rooms/${roomId}/votes`);
        const votesData = await votesRes.json();
        const voteList = votesRes.ok && votesData.success ? votesData.votes : [];
        setVotes(voteList);

        // Check if user has previously voted stored in local storage nickname key
        const savedNickname = typeof window !== 'undefined' ? localStorage.getItem(`moyeoit_voted_${roomId}`) : null;
        if (savedNickname && voteList.length > 0) {
          const found = voteList.find((v: Vote) => v.nickname.toLowerCase() === savedNickname.toLowerCase());
          if (found) {
            setMyVote(found);
          }
        }
      } else {
        setRoom(null);
      }
    } catch (e) {
      console.error('Failed to load room data:', e);
      setRoom(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoomData();
  }, [roomId]);

  // 1. Offline State
  if (isOffline) {
    return <OfflineState onRetry={loadRoomData} />;
  }

  // 2. Loading State
  if (loading) {
    return <LoadingState message="약속 날짜 정보를 불러오는 중입니다..." />;
  }

  // 3. Invalid Link / Not Found State
  if (!room) {
    return <InvalidLinkState />;
  }

  const heatmapMap = computeHeatmapData(room, votes);
  const totalVotersCount = votes.length;
  const goldenRecommendations = extractGoldenDates(heatmapMap, totalVotersCount);
  const isVoted = Boolean(myVote);

  const handleSubmitVote = async (input: SubmitVoteInput) => {
    const res = await fetch(`/api/rooms/${roomId}/votes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || '투표 제출 중 오류가 발생했습니다.');
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(`moyeoit_voted_${roomId}`, input.nickname);
    }

    await loadRoomData();
    setShowVoteForm(false);
  };

  const handleConfirmDate = (date: string, timeSlot?: string) => {
    const key = timeSlot ? `${date}_${timeSlot}` : date;
    setConfirmedKey(key);
    setConfirmedDateInfo({ date, timeSlot });
  };

  return (
    <main className="min-h-screen max-w-3xl mx-auto px-4 py-4 space-y-5 flex flex-col justify-between pb-24 sm:pb-8">
      <div className="space-y-5">
        {/* Section A: Compact Header & Single Share Button */}
        <header className="flex items-center justify-between py-2 border-b border-[var(--color-border-subtle)]">
          <button
            type="button"
            onClick={() => router.push('/')}
            className="flex items-center gap-1 text-xs font-bold text-zinc-400 hover:text-zinc-100 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>홈으로</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowShareSheet(true)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-extrabold bg-amber-400 text-zinc-950 hover:bg-amber-300 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 fill-zinc-950" />
              <span>초대하기</span>
            </button>
          </div>
        </header>

        {/* Room Header Info */}
        <section className="sys-card p-5 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-bold text-amber-300 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>{room.schedule_type === 'date_time' ? '날짜 + 시간대 조율' : '날짜 전용 조율'}</span>
            </span>
            <span className="text-xs text-zinc-400 font-medium flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span>참여자 <strong className="text-emerald-400 font-bold">{totalVotersCount}명</strong></span>
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-zinc-100 leading-tight">{room.title}</h1>

          {room.description && (
            <p className="text-xs text-zinc-400">{room.description}</p>
          )}
        </section>

        {/* Section B: Voted vs Unvoted State Separation */}
        {isVoted && !showVoteForm ? (
          /* State B: Already Voted Summary Banner */
          <div className="p-4 rounded-2xl bg-zinc-900 border border-emerald-500/30 flex items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold shrink-0">
                <Check className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-extrabold text-zinc-100">
                  {myVote?.nickname}님의 가능 날짜 투표가 완료되었습니다!
                </p>
                <p className="text-[11px] text-zinc-400">
                  결과를 확인하거나 일정이 변경되면 언제든 수정할 수 있습니다.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowVoteForm(true)}
              className="shrink-0 px-3 py-1.5 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>투표 수정</span>
            </button>
          </div>
        ) : (
          /* State A: Primary Voting Form */
          <GuestVoteForm
            room={room}
            existingVote={myVote}
            onSubmitVote={handleSubmitVote}
            onCancel={isVoted ? () => setShowVoteForm(false) : undefined}
          />
        )}

        {/* TOP 1 Decision Focus Card */}
        <GoldenDateCard
          recommendations={goldenRecommendations}
          onConfirmDate={handleConfirmDate}
          selectedConfirmedKey={confirmedKey}
        />

        {/* Affiliate Recommendation Widget when date confirmed */}
        {confirmedDateInfo && (
          <AffiliateButtons
            confirmedDate={confirmedDateInfo.date}
            timeSlot={confirmedDateInfo.timeSlot}
          />
        )}

        {/* Collapsible Heatmap Matrix */}
        <HeatmapGrid
          room={room}
          heatmapMap={heatmapMap}
          totalVotersCount={totalVotersCount}
        />

        {/* Single Non-intrusive Bottom Ad */}
        <AdBanner slotType="bottom_vote" />
      </div>

      {/* Unified Share Sheet Modal */}
      {showShareSheet && (
        <ShareSheet room={room} onClose={() => setShowShareSheet(false)} />
      )}

      {/* Mobile Sticky Floating CTA Bar */}
      <div className="fixed bottom-4 left-4 right-4 z-40 sm:hidden">
        <div className="sys-card p-2.5 bg-zinc-950/90 backdrop-blur-md border border-zinc-800 flex items-center justify-between gap-2 shadow-2xl">
          {!isVoted || showVoteForm ? (
            <button
              type="button"
              onClick={() => setShowVoteForm(true)}
              className="flex-1 sys-btn-primary h-11 text-xs font-extrabold flex items-center justify-center gap-1.5"
            >
              <VoteIcon className="w-4 h-4" />
              <span>✨ 내 가능 날짜 선택하기</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowShareSheet(true)}
              className="flex-1 h-11 rounded-2xl bg-amber-400 text-zinc-950 font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md"
            >
              <Share2 className="w-4 h-4 fill-zinc-950" />
              <span>친구들에게 초대 링크 전달하기</span>
            </button>
          )}
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </main>
  );
}
