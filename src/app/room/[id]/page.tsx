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
import { Share2, Vote as VoteIcon, ArrowLeft, Sparkles, Check, Edit3, Users, Crown, Settings, Trash2, AlertTriangle, X } from 'lucide-react';

export default function RoomDetailPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params?.id as string;

  const [room, setRoom] = useState<Room | null>(null);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);

  // Host role tracking
  const [isHost, setIsHost] = useState(false);

  // My vote tracking
  const [myVote, setMyVote] = useState<Vote | null>(null);
  const [showVoteForm, setShowVoteForm] = useState(false);
  const [showShareSheet, setShowShareSheet] = useState(false);

  // Vote deletion modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePin, setDeletePin] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteErrorMsg, setDeleteErrorMsg] = useState('');

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

        // Check if user is host
        const isHostStored = typeof window !== 'undefined' ? localStorage.getItem(`moyeoit_host_${roomId}`) === 'true' : false;
        setIsHost(isHostStored);

        // Check if user has previously voted stored in local storage nickname key
        const savedNickname = typeof window !== 'undefined' ? localStorage.getItem(`moyeoit_voted_${roomId}`) : null;
        if (savedNickname && voteList.length > 0) {
          const found = voteList.find((v: Vote) => v.nickname.toLowerCase() === savedNickname.toLowerCase());
          if (found) {
            setMyVote(found);
          } else {
            setMyVote(null);
          }
        } else {
          setMyVote(null);
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

  const handleDeleteVote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!myVote) return;

    setIsDeleting(true);
    setDeleteErrorMsg('');

    try {
      const res = await fetch(`/api/rooms/${roomId}/votes`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nickname: myVote.nickname,
          password: deletePin.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || '닉네임 또는 PIN이 올바르지 않습니다.');
      }

      if (typeof window !== 'undefined') {
        localStorage.removeItem(`moyeoit_voted_${roomId}`);
      }

      setMyVote(null);
      setShowDeleteModal(false);
      setDeletePin('');
      await loadRoomData();
    } catch (err: any) {
      setDeleteErrorMsg(err.message || '투표 삭제 중 오류가 발생했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConfirmDate = (date: string, timeSlot?: string) => {
    const key = timeSlot ? `${date}_${timeSlot}` : date;
    setConfirmedKey(key);
    setConfirmedDateInfo({ date, timeSlot });
  };

  // Fallback title if room title is empty or numeric
  const displayTitle = room.title && room.title.trim().length > 0 && isNaN(Number(room.title.trim()))
    ? room.title
    : '📅 모임 약속 날짜 정하기';

  return (
    <main className="min-h-screen max-w-3xl mx-auto px-4 py-4 space-y-5 flex flex-col justify-between pb-24 sm:pb-8">
      <div className="space-y-5">
        {/* Navigation Top Bar */}
        <header className="flex items-center justify-between py-2 border-b border-slate-200/80">
          <button
            type="button"
            onClick={() => router.push('/')}
            className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-900 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>홈으로</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowShareSheet(true)}
              className="px-3.5 py-1.5 rounded-2xl text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 hover:bg-indigo-100 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>초대 링크 공유</span>
            </button>
          </div>
        </header>

        {/* SECTION A: Room Header */}
        <section className="sys-card p-5 sm:p-6 space-y-2 border-slate-200/80 shadow-sm bg-white">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-600" />
                <span>{room.schedule_type === 'date_time' ? '날짜 + 시간대 조율' : '날짜 전용 조율'}</span>
              </span>

              {isHost && (
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Crown className="w-3 h-3 text-amber-500 fill-amber-500" />
                  <span>방장</span>
                </span>
              )}
            </div>

            <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-emerald-600" />
              <span>참여자 <strong className="text-emerald-600 font-extrabold">{totalVotersCount}명</strong></span>
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">{displayTitle}</h1>

          {room.description && (
            <p className="text-xs sm:text-sm text-slate-500">{room.description}</p>
          )}
        </section>

        {/* SECTION B: User Vote Section (PRIMARY FOCUS) */}
        {isVoted && !showVoteForm ? (
          /* Submission Success State */
          <div className="sys-card p-5 sm:p-6 border-emerald-200 bg-emerald-50/50 space-y-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-bold shrink-0 shadow-md shadow-emerald-500/20">
                  <Check className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900">
                    🎉 {myVote?.nickname}님의 가능 날짜 투표가 저장되었습니다!
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    일정이 변경되면 언제든 아래 버튼으로 수정하거나 삭제할 수 있습니다.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1 border-t border-emerald-100 flex-wrap">
              <button
                type="button"
                onClick={() => setShowShareSheet(true)}
                className="flex-1 min-w-[140px] py-2.5 rounded-2xl bg-indigo-600 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-indigo-500/20 cursor-pointer hover:bg-indigo-700 transition-all"
              >
                <Share2 className="w-3.5 h-3.5 fill-white" />
                <span>⚡ 친구들에게 초대 링크 전달하기</span>
              </button>

              <button
                type="button"
                onClick={() => setShowVoteForm(true)}
                className="px-3.5 py-2.5 rounded-2xl bg-white text-slate-700 hover:bg-slate-100 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer border border-slate-200 shadow-sm"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>투표 수정</span>
              </button>

              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="px-3.5 py-2.5 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                <span>내 투표 삭제</span>
              </button>
            </div>
          </div>
        ) : (
          /* Unvoted / Editing Form */
          <div id="vote-form-section">
            <GuestVoteForm
              room={room}
              existingVote={myVote}
              onSubmitVote={handleSubmitVote}
              onCancel={isVoted ? () => setShowVoteForm(false) : undefined}
            />
          </div>
        )}

        {/* SECTION C: Golden Date Recommendation Card (TERTIARY FOCUS) */}
        <GoldenDateCard
          recommendations={goldenRecommendations}
          onConfirmDate={handleConfirmDate}
          onShare={() => setShowShareSheet(true)}
          selectedConfirmedKey={confirmedKey}
          isHost={isHost}
        />

        {/* Affiliate Reservation Buttons (When Date Confirmed) */}
        {confirmedDateInfo && (
          <AffiliateButtons
            confirmedDate={confirmedDateInfo.date}
            timeSlot={confirmedDateInfo.timeSlot}
          />
        )}

        {/* SECTION D: Collapsible Full Response Details / Heatmap */}
        {totalVotersCount > 0 && (
          <HeatmapGrid
            room={room}
            heatmapMap={heatmapMap}
            totalVotersCount={totalVotersCount}
          />
        )}

        {/* Host Room Management Notice */}
        {isHost && (
          <div className="p-4 sm:p-5 rounded-3xl bg-amber-50/70 border border-amber-200/80 space-y-2 text-xs">
            <div className="flex items-center gap-1.5 text-amber-800 font-black">
              <Settings className="w-4 h-4 text-amber-600" />
              <span>방장 모임 관리 안내</span>
            </div>
            <p className="text-[11px] sm:text-xs text-amber-900/80 leading-relaxed">
              방장은 최적 약속 날짜 1위 카드에서 <strong>[이 날짜로 모임 확정하기]</strong> 버튼을 통해 약속 날짜를 최종 확정할 수 있습니다.
              초대 링크를 단톡방에 전달하여 참여자의 가능 날짜 투표를 완료해 주세요.
            </p>
          </div>
        )}

        {/* Single Bottom Ad Banner */}
        <AdBanner slotType="bottom_vote" />
      </div>

      {/* Share Sheet Modal */}
      {showShareSheet && (
        <ShareSheet room={room} onClose={() => setShowShareSheet(false)} />
      )}

      {/* User Vote Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="sys-card w-full max-w-sm p-5 space-y-4 border-rose-200 bg-white shadow-2xl rounded-3xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2 text-rose-600">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-sm font-black text-slate-900">내 투표 삭제</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletePin('');
                  setDeleteErrorMsg('');
                }}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600">
              <p className="font-bold text-slate-900">
                내 투표를 삭제할까요?
              </p>
              <p className="text-slate-500 leading-relaxed">
                삭제하면 이 방에서 <strong className="text-slate-800">{myVote?.nickname}</strong>님의 투표 정보가 완전히 제거되며 집계 결과가 갱신됩니다.
              </p>
            </div>

            {deleteErrorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold">
                ⚠️ {deleteErrorMsg}
              </div>
            )}

            <form onSubmit={handleDeleteVote} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  수정용 비밀번호 4자리 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  inputMode="numeric"
                  maxLength={4}
                  autoComplete="off"
                  value={deletePin}
                  onChange={(e) => setDeletePin(e.target.value)}
                  placeholder="투표할 때 설정한 숫자 4자리"
                  className="w-full sys-input h-11 text-xs"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletePin('');
                    setDeleteErrorMsg('');
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 cursor-pointer"
                >
                  취소
                </button>

                <button
                  type="submit"
                  disabled={isDeleting}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black flex items-center justify-center gap-1 disabled:opacity-50 cursor-pointer shadow-md shadow-rose-600/20"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isDeleting ? '삭제 중...' : '내 투표 삭제하기'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SINGLE Mobile Sticky Floating CTA Bar */}
      <div className="fixed bottom-4 left-4 right-4 z-40 sm:hidden">
        <div className="sys-card p-2.5 bg-white/90 backdrop-blur-md border border-slate-200/80 flex items-center justify-between gap-2 shadow-xl shadow-slate-900/10 rounded-2xl">
          {!isVoted || showVoteForm ? (
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('vote-form-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                else setShowVoteForm(true);
              }}
              className="flex-1 sys-btn-primary h-11 text-xs font-black flex items-center justify-center gap-1.5"
            >
              <VoteIcon className="w-4 h-4" />
              <span>✨ 내 가능 날짜 선택하기</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowShareSheet(true)}
              className="flex-1 h-11 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20 cursor-pointer hover:bg-indigo-700 transition-all"
            >
              <Share2 className="w-4 h-4 fill-white" />
              <span>⚡ 친구들에게 초대 링크 전달하기</span>
            </button>
          )}
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </main>
  );
}
