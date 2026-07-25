'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Room, Vote, SubmitVoteInput } from '@/types/schema';
import { getRoomByIdMock, getVotesByRoomIdMock, submitVoteMock } from '@/lib/mockStore';
import { computeHeatmapData, extractGoldenDates, formatKoreanDate } from '@/lib/analytics';
import { GoldenDateCard } from '@/components/ui/GoldenDateCard';
import { HeatmapGrid } from '@/components/ui/HeatmapGrid';
import { GuestVoteForm } from '@/components/ui/GuestVoteForm';
import { ShareModal } from '@/components/ui/ShareModal';
import { AdBanner } from '@/components/ui/Monetization/AdBanner';
import { AffiliateButtons } from '@/components/ui/Monetization/AffiliateButtons';
import { Calendar, Share2, Vote as VoteIcon, ArrowLeft, CheckCircle2, Sparkles, RefreshCw } from 'lucide-react';

export default function RoomDetailPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params?.id as string;

  const [room, setRoom] = useState<Room | null>(null);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [showVoteForm, setShowVoteForm] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [confirmedKey, setConfirmedKey] = useState<string | undefined>(undefined);
  const [confirmedDateInfo, setConfirmedDateInfo] = useState<{ date: string; timeSlot?: string } | null>(null);

  // Load room and votes data
  const loadRoomData = () => {
    if (!roomId) return;
    const roomData = getRoomByIdMock(roomId);
    if (roomData) {
      setRoom(roomData);
      const voteData = getVotesByRoomIdMock(roomId);
      setVotes(voteData);
    }
  };

  useEffect(() => {
    loadRoomData();
  }, [roomId]);

  if (!room) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 text-center">
        <div className="glass-card rounded-2xl p-8 border border-purple-500/20 max-w-md w-full space-y-4">
          <div className="w-12 h-12 rounded-full bg-purple-900/50 text-purple-300 flex items-center justify-center mx-auto">
            <RefreshCw className="w-6 h-6 animate-spin" />
          </div>
          <h2 className="text-lg font-bold text-white">모임 정보를 불러오는 중입니다...</h2>
          <p className="text-xs text-purple-300">
            방 번호가 올바른지 확인해주세요. ({roomId})
          </p>
          <button
            type="button"
            onClick={() => router.push('/')}
            className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs"
          >
            메인 페이지로 이동
          </button>
        </div>
      </main>
    );
  }

  // Compute Heatmap and Top Golden Dates
  const heatmapMap = computeHeatmapData(room, votes);
  const totalVotersCount = votes.length;
  const goldenRecommendations = extractGoldenDates(heatmapMap, totalVotersCount);

  // Handle vote submission
  const handleSubmitVote = (input: SubmitVoteInput) => {
    submitVoteMock(input);
    loadRoomData();
    setShowVoteForm(false);
  };

  const handleConfirmDate = (date: string, timeSlot?: string) => {
    const key = timeSlot ? `${date}_${timeSlot}` : date;
    setConfirmedKey(key);
    setConfirmedDateInfo({ date, timeSlot });
  };

  return (
    <main className="min-h-screen max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Top Header */}
      <header className="flex items-center justify-between py-2 border-b border-purple-500/20">
        <button
          type="button"
          onClick={() => router.push('/')}
          className="flex items-center gap-1.5 text-xs font-bold text-purple-300 hover:text-white transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>모여잇 홈으로</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowShareModal(true)}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-400 text-black hover:bg-amber-300 transition-all flex items-center gap-1.5 shadow-md"
          >
            <Share2 className="w-3.5 h-3.5 fill-black" />
            <span>초대하기</span>
          </button>
        </div>
      </header>

      {/* Room Title Card */}
      <section className="glass-card rounded-3xl p-6 border border-purple-500/30 bg-gradient-to-br from-purple-950/40 via-violet-950/20 to-black space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-[11px] font-bold text-amber-300 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>{room.schedule_type === 'date_time' ? '날짜 + 시간대 조율' : '날짜 전용 조율'}</span>
          </span>
          <span className="text-xs text-purple-300 font-semibold">
            총 참여자: <strong className="text-emerald-400 font-bold">{totalVotersCount}명</strong>
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-white">{room.title}</h1>

        {room.description && (
          <p className="text-xs sm:text-sm text-purple-200/90 font-medium">
            {room.description}
          </p>
        )}

        {/* Action button bar */}
        <div className="pt-2 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setShowVoteForm(!showVoteForm)}
            className="px-5 py-2.5 rounded-xl gradient-button text-white text-xs font-black shadow-lg flex items-center gap-2 transform active:scale-95"
          >
            <VoteIcon className="w-4 h-4" />
            <span>{showVoteForm ? '투표 창 닫기' : '⚡ 내 가능 날짜 투표하기 (10초)'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowShareModal(true)}
            className="px-4 py-2.5 rounded-xl bg-purple-900/50 hover:bg-purple-800 text-purple-200 border border-purple-500/30 text-xs font-bold flex items-center gap-1.5"
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

      {/* Guest Vote Form (Toggleable or default visible if no votes) */}
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
    </main>
  );
}
