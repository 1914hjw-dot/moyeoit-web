'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Room, Vote, SubmitVoteInput } from '@/types/schema';
import { getRoomByIdMock, getVotesByRoomIdMock, submitVoteMock } from '@/lib/mockStore';
import { computeHeatmapData, extractGoldenDates } from '@/lib/analytics';
import { GoldenDateCard } from '@/components/ui/GoldenDateCard';
import { HeatmapGrid } from '@/components/ui/HeatmapGrid';
import { GuestVoteForm } from '@/components/ui/GuestVoteForm';
import { ShareModal } from '@/components/ui/ShareModal';
import { AdBanner } from '@/components/ui/Monetization/AdBanner';
import { AffiliateButtons } from '@/components/ui/Monetization/AffiliateButtons';
import { Footer } from '@/components/ui/Footer';
import {
  LoadingState,
  OfflineState,
  InvalidLinkState,
  EmptyVoteState,
} from '@/components/ui/StateViews';
import { Share2, Vote as VoteIcon, ArrowLeft, Sparkles, Send, Copy, Check } from 'lucide-react';

export default function RoomDetailPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params?.id as string;

  const [room, setRoom] = useState<Room | null>(null);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [showVoteForm, setShowVoteForm] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedQuick, setCopiedQuick] = useState(false);
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

  const loadRoomData = () => {
    if (!roomId) return;
    setLoading(true);
    try {
      const roomData = getRoomByIdMock(roomId);
      if (roomData) {
        setRoom(roomData);
        const voteData = getVotesByRoomIdMock(roomId);
        setVotes(voteData);
        if (voteData.length === 0) {
          setShowShareModal(true);
        }
      } else {
        setRoom(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoomData();
  }, [roomId]);

  const handleQuickCopy = async () => {
    if (typeof window === 'undefined' || !room) return;
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/room/${room.id}`);
      setCopiedQuick(true);
      setTimeout(() => setCopiedQuick(false), 2000);
    } catch {
      setCopiedQuick(true);
    }
  };

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

  const handleSubmitVote = async (input: SubmitVoteInput) => {
    await submitVoteMock(input);
    loadRoomData();
    setShowVoteForm(false);
  };

  const handleConfirmDate = (date: string, timeSlot?: string) => {
    const key = timeSlot ? `${date}_${timeSlot}` : date;
    setConfirmedKey(key);
    setConfirmedDateInfo({ date, timeSlot });
  };

  return (
    <main className="min-h-screen max-w-4xl mx-auto px-4 py-6 space-y-6 flex flex-col justify-between pb-24 sm:pb-8">
      <div className="space-y-6">
        {/* Top Header */}
        <header className="flex items-center justify-between py-2 border-b border-[var(--color-border-subtle)]">
          <button
            type="button"
            onClick={() => router.push('/')}
            className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 hover:text-zinc-100 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>모여잇 홈</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleQuickCopy}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                copiedQuick ? 'bg-emerald-500 text-zinc-950' : 'bg-zinc-900 text-zinc-300 border border-zinc-800'
              }`}
            >
              {copiedQuick ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedQuick ? '복사됨!' : '링크 복사'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowShareModal(true)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-400 text-zinc-950 hover:bg-amber-300 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 fill-zinc-950" />
              <span>초대하기</span>
            </button>
          </div>
        </header>

        {/* High-visibility Post-Creation Share Banner */}
        {totalVotersCount === 0 && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-400 text-zinc-950 shrink-0 font-black">
                <Send className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-extrabold text-zinc-100">
                  약속 방 생성이 완료되었어요! 친구들에게 초대 링크를 공유하세요
                </h4>
                <p className="text-[11px] text-zinc-400">
                  단톡방에 공유하면 친구들이 10초 만에 투표하고 최적의 황금 날짜가 자동으로 계산됩니다.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowShareModal(true)}
              className="w-full sm:w-auto shrink-0 px-4 py-2 rounded-xl bg-amber-400 text-zinc-950 text-xs font-extrabold hover:bg-amber-300 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Share2 className="w-3.5 h-3.5 fill-zinc-950" />
              <span>카카오톡으로 공유하기</span>
            </button>
          </div>
        )}

        {/* Room Title Card */}
        <section className="sys-card p-6 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] font-semibold text-amber-300 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>{room.schedule_type === 'date_time' ? '날짜 + 시간대 조율' : '날짜 전용 조율'}</span>
            </span>
            <span className="text-xs text-zinc-400 font-medium">
              참여 인원: <strong className="text-emerald-400 font-bold">{totalVotersCount}명</strong>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-100">{room.title}</h1>

          {room.description && (
            <p className="text-xs sm:text-sm text-zinc-400">
              {room.description}
            </p>
          )}

          {/* Action Button Bar */}
          <div className="pt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setShowVoteForm(!showVoteForm)}
              className="px-4 py-2.5 rounded-xl sys-btn-primary text-xs font-extrabold flex items-center gap-2 shadow-sm"
            >
              <VoteIcon className="w-4 h-4" />
              <span>{showVoteForm ? '투표 창 닫기' : '내 가능 날짜 투표하기 (10초)'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowShareModal(true)}
              className="px-3.5 py-2.5 rounded-xl sys-btn-secondary text-xs font-semibold flex items-center gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>카톡 공유</span>
            </button>
          </div>
        </section>

        {/* Share Modal popup */}
        {showShareModal && (
          <ShareModal room={room} onClose={() => setShowShareModal(false)} />
        )}

        {/* Empty State Banner if 0 votes */}
        {totalVotersCount === 0 && !showVoteForm && (
          <EmptyVoteState onStartVote={() => setShowVoteForm(true)} />
        )}

        {/* Guest Vote Form */}
        {(showVoteForm || totalVotersCount === 0) && (
          <GuestVoteForm
            room={room}
            onSubmitVote={handleSubmitVote}
            onCancel={totalVotersCount > 0 ? () => setShowVoteForm(false) : undefined}
          />
        )}

        {/* Top Heatmap Ad Slot */}
        <AdBanner slotType="top_heatmap" />

        {/* Golden Dates Recommendation TOP 1, 2, 3 */}
        <GoldenDateCard
          recommendations={goldenRecommendations}
          onConfirmDate={handleConfirmDate}
          selectedConfirmedKey={confirmedKey}
        />

        {/* Affiliate Recommendation Widget when date is confirmed or top date selected */}
        {confirmedDateInfo && (
          <AffiliateButtons
            confirmedDate={confirmedDateInfo.date}
            timeSlot={confirmedDateInfo.timeSlot}
          />
        )}

        {/* Color Heatmap Grid */}
        <HeatmapGrid
          room={room}
          heatmapMap={heatmapMap}
          totalVotersCount={totalVotersCount}
        />

        {/* Bottom Ad Banner */}
        <AdBanner slotType="bottom_vote" />
      </div>

      {/* Apple-level Sticky Mobile Floating Action Bar (Cycle 2 Optimization) */}
      <div className="fixed bottom-4 left-4 right-4 z-40 sm:hidden">
        <div className="sys-card p-3 bg-zinc-950/90 backdrop-blur-md border border-zinc-800 flex items-center justify-between gap-2 shadow-2xl">
          <button
            type="button"
            onClick={() => setShowVoteForm(true)}
            className="flex-1 sys-btn-primary h-11 text-xs font-extrabold flex items-center justify-center gap-1.5"
          >
            <VoteIcon className="w-4 h-4" />
            <span>⚡ 10초 투표하기</span>
          </button>

          <button
            type="button"
            onClick={() => setShowShareModal(true)}
            className="px-3.5 h-11 rounded-xl bg-amber-400 text-zinc-950 font-extrabold text-xs flex items-center justify-center gap-1"
          >
            <Share2 className="w-4 h-4 fill-zinc-950" />
            <span>공유</span>
          </button>
        </div>
      </div>

      {/* Shared Legal Footer */}
      <Footer />
    </main>
  );
}
