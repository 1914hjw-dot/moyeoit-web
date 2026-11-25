'use client';

import React, { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Room, Vote, SubmitVoteInput } from '@/types/schema';
import { computeHeatmapData } from '@/lib/analytics';
import { trackRoomJoin, trackVoteSubmit, trackRoomConfirmed } from '@/lib/gtag';
import {
  clearLastVoterHint,
  findHintedVote,
  getLastVoterHint,
  purgeLegacyVoteTokens,
  saveLastVoterHint,
} from '@/lib/client/voterHintStorage';
import { GoldenDateCard } from '@/components/ui/GoldenDateCard';
import { ConfirmedResultCard } from '@/components/ui/RoomDetail/ConfirmedResultCard';
import { MultiShareButton } from '@/components/ui/MultiShareButton';
import { HeatmapGrid } from '@/components/ui/HeatmapGrid';
import { GuestVoteForm } from '@/components/ui/GuestVoteForm';
import { ShareSheet } from '@/components/ui/ShareSheet';
import { AdFitBanner } from '@/components/ads';
import { ADFIT_ROOM_UNIT_ID } from '@/lib/ads';
import { Footer } from '@/components/ui/Footer';
import {
  LoadingState,
  OfflineState,
  InvalidLinkState,
} from '@/components/ui/StateViews';
import { Vote as VoteIcon, ArrowLeft, Check, Edit3, Users, Crown, Trash2, AlertTriangle, X, UserPlus } from 'lucide-react';

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

function getRoomIdentifiers(roomId: string, room: Room): string[] {
  return Array.from(new Set([roomId, room.id, room.legacy_slug].filter((id): id is string => Boolean(id))));
}

function subscribeConnectivity(callback: () => void): () => void {
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);
  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
}

function getOfflineSnapshot(): boolean {
  return !navigator.onLine;
}

function getServerOfflineSnapshot(): boolean {
  return false;
}

export default function RoomDetailPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params?.id as string;
  const joinedRoomIdRef = useRef<string | null>(null);

  const [room, setRoom] = useState<Room | null>(null);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(true);
  const isOffline = useSyncExternalStore(
    subscribeConnectivity,
    getOfflineSnapshot,
    getServerOfflineSnapshot
  );

  // Host role tracking
  const [isHost, setIsHost] = useState(false);

  // Selected participant tracking (UI selection only; never used as authentication)
  const [myVote, setMyVote] = useState<Vote | null>(null);
  const [lastSelectedVoteId, setLastSelectedVoteId] = useState<string | null>(null);
  const [showVoteForm, setShowVoteForm] = useState(false);
  const [showShareSheet, setShowShareSheet] = useState(false);

  // Vote deletion modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePin, setDeletePin] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteErrorMsg, setDeleteErrorMsg] = useState('');

  const fetchLatestVotes = useCallback(async (): Promise<Vote[]> => {
    if (!roomId) return [];
    const votesRes = await fetch(`/api/rooms/${roomId}/votes`, { cache: 'no-store' });
    const votesData = await votesRes.json();
    return votesRes.ok && votesData.success && Array.isArray(votesData.votes)
      ? (votesData.votes as Vote[])
      : [];
  }, [roomId]);

  const loadRoomData = useCallback(
    async (preferredVoteId?: string | null) => {
      if (!roomId) return;
      try {
        const roomRes = await fetch(`/api/rooms/${roomId}`, {
          credentials: 'same-origin',
          cache: 'no-store',
        });
        const roomData = await roomRes.json();

        if (roomRes.ok && roomData.success && roomData.room) {
          const loadedRoom = roomData.room as Room;
          if (joinedRoomIdRef.current !== roomId) {
            trackRoomJoin(loadedRoom.date_selection_mode || 'RANGE', loadedRoom.status || 'OPEN');
            joinedRoomIdRef.current = roomId;
          }
          setRoom(loadedRoom);

          const voteList = await fetchLatestVotes();
          setVotes(voteList);

          const identifiers = getRoomIdentifiers(roomId, loadedRoom);
          purgeLegacyVoteTokens(identifiers);

          const hasLegacyHostSecret = Boolean(
            identifiers
              .map((identifier) => localStorage.getItem(`moyeoit_host_secret_${identifier}`))
              .find(Boolean)
          );
          setIsHost(Boolean(roomData.is_host) || hasLegacyHostSecret);

          // Pure UX convenience: pre-select the last participant viewed/submitted in this browser.
          const hinted =
            (preferredVoteId ? voteList.find((v) => v.id === preferredVoteId) || null : null) ||
            findHintedVote(voteList, getLastVoterHint(identifiers));

          if (hinted) {
            setMyVote(hinted);
            setLastSelectedVoteId(hinted.id);
          } else {
            setMyVote(null);
            setLastSelectedVoteId(null);
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
    },
    [roomId, fetchLatestVotes]
  );

  useEffect(() => {
    const timer = window.setTimeout(() => void loadRoomData(), 0);
    return () => window.clearTimeout(timer);
  }, [loadRoomData]);

  if (isOffline) return <OfflineState onRetry={loadRoomData} />;
  if (loading) return <LoadingState message="약속 정보를 불러오는 중입니다..." />;
  if (!room) return <InvalidLinkState />;

  const shareUrlId = room.legacy_slug || room.id;
  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/room/${shareUrlId}`
    : `https://moyeoit-web.vercel.app/room/${shareUrlId}`;
  const heatmapMap = computeHeatmapData(room, votes);
  const totalVotersCount = votes.length;
  const isVoted = Boolean(myVote);
  const isConfirmed = room.status === 'CONFIRMED';
  const isDemoRoom = room.id.startsWith('demo-room-');
  const isSelectedLegacyPasswordless = myVote?.has_password === false;

  const handleSelectVote = (vote: Vote, openEditForm: boolean) => {
    saveLastVoterHint(getRoomIdentifiers(roomId, room), {
      id: vote.id,
      nickname: vote.nickname,
    });
    setMyVote(vote);
    setLastSelectedVoteId(vote.id);
    setShowVoteForm(openEditForm && !isConfirmed && vote.has_password !== false);
  };

  const fallbackSavedVote = !myVote && lastSelectedVoteId
    ? votes.find((v) => v.id === lastSelectedVoteId) || null
    : null;

  const handleSubmitVote = async (input: SubmitVoteInput) => {
    const res = await fetch(`/api/rooms/${roomId}/votes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      if (res.status === 409 && data.code === 'VOTE_CONFLICT') {
        try {
          const freshVotes = await fetchLatestVotes();
          setVotes(freshVotes);
        } catch {
          // Keep existing vote list if refresh fails
        }
      }
      throw new Error(data.error || '투표 제출 중 오류가 발생했습니다.');
    }

    trackVoteSubmit(room.date_selection_mode, Object.keys(input.availability).length);

    const savedVote = data.vote as Vote | undefined;
    if (savedVote?.id && savedVote?.nickname) {
      saveLastVoterHint(getRoomIdentifiers(roomId, room), {
        id: savedVote.id,
        nickname: savedVote.nickname,
      });
    }

    await loadRoomData(savedVote?.id);
    setShowVoteForm(false);
  };

  const handleDeleteVote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!myVote) return;

    const requiresPin = myVote.has_password !== false;
    if (requiresPin && !/^\d{4}$/.test(deletePin.trim())) {
      setDeleteErrorMsg('비밀번호 숫자 4자리를 입력해 주세요.');
      return;
    }

    setIsDeleting(true);
    setDeleteErrorMsg('');

    try {
      const res = await fetch(`/api/rooms/${roomId}/votes`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vote_id: myVote.id,
          nickname: myVote.nickname,
          password: requiresPin ? deletePin.trim() : '',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || '투표를 삭제하지 못했습니다.');
      }

      clearLastVoterHint(getRoomIdentifiers(roomId, room));
      setMyVote(null);
      setLastSelectedVoteId(null);
      setShowDeleteModal(false);
      setDeletePin('');
      await loadRoomData();
    } catch (error) {
      setDeleteErrorMsg(getErrorMessage(error, '투표 삭제 중 오류가 발생했습니다.'));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConfirmDate = async (dateKey: string) => {
    if (!isHost) {
      alert('이 약속 방을 생성한 방장 브라우저에서만 확정할 수 있습니다.');
      return;
    }

    const legacyHostSecret = getRoomIdentifiers(roomId, room)
      .map((identifier) => localStorage.getItem(`moyeoit_host_secret_${identifier}`))
      .find(Boolean);

    try {
      const res = await fetch(`/api/rooms/${room.id}/confirm`, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          confirmed_date: dateKey,
          ...(legacyHostSecret ? { host_secret: legacyHostSecret } : {}),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || '날짜 확정에 실패했습니다.');
      }

      trackRoomConfirmed(room.date_selection_mode);
      await loadRoomData(myVote?.id);
    } catch (error) {
      alert(getErrorMessage(error, '날짜 확정에 실패했습니다.'));
    }
  };

  const displayTitle = room.title && room.title.trim().length > 0 && isNaN(Number(room.title.trim()))
    ? room.title
    : '모임 약속 날짜 정하기';

  return (
    <main className="min-h-screen max-w-2xl mx-auto px-4 py-4 space-y-6 flex flex-col justify-between pb-24 sm:pb-8">
      <div className="space-y-6">
        {/* Navigation & Header */}
        <header className="flex items-center justify-between py-2 border-b border-slate-200/80">
          <button
            type="button"
            onClick={() => router.push('/')}
            className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-900 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>홈으로</span>
          </button>

          <MultiShareButton
            title={room.title}
            url={shareUrl}
            confirmedDate={isConfirmed && room.confirmed_date ? room.confirmed_date : undefined}
            className="px-3.5 py-1.5 rounded-2xl text-xs font-extrabold"
          />
        </header>

        {/* CONFIRMED CELEBRATION HEADER (If confirmed) */}
        {isConfirmed ? (
          <ConfirmedResultCard room={room} votes={votes} shareUrl={shareUrl} />
        ) : (
          /* SECTION 1: 모임 정보 (OPEN 상태일 때) */
          <section className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                <span>STEP 1 · 모임 정보</span>
              </span>
            </div>

            <div className="sys-card p-5 sm:p-6 space-y-2 border-slate-200/80 shadow-sm bg-white rounded-3xl">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                    {room.schedule_type === 'date_time' ? '날짜 + 시간대' : '날짜 전용'}
                  </span>
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                    {room.date_selection_mode === 'FREE' ? '자유 날짜 모드' : '기간 지정 모드'}
                  </span>
                  {isHost && (
                    <span className="text-[10px] font-bold text-slate-800 bg-slate-100 border border-slate-200 px-2 rounded-full flex items-center gap-0.5">
                      <Crown className="w-3 h-3 text-slate-700 fill-slate-700" />
                      <span>방장</span>
                    </span>
                  )}
                </div>

                <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-emerald-600" />
                  <span>참여자 <strong className="text-emerald-600 font-extrabold">{totalVotersCount}명</strong></span>
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">{displayTitle}</h1>
              {room.description && <p className="text-xs text-slate-500">{room.description}</p>}
            </div>
          </section>
        )}

        {/* SECTION 2: 내 가능 날짜 투표 */}
        <section className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              <span>STEP 2 · 내 가능 날짜 투표</span>
            </span>
          </div>

          {isDemoRoom ? (
            <div className="sys-card p-5 border-indigo-200 bg-indigo-50/60 text-center space-y-2 rounded-3xl">
              <p className="text-sm font-black text-slate-900">읽기 전용 시연 모임방입니다.</p>
              <p className="text-xs text-slate-600">
                실제 투표 흐름을 사용하려면 홈에서 새 모임방을 만들어 주세요.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {votes.length > 0 && (
                <div className="sys-card p-3.5 sm:p-4 bg-white border-slate-200/80 shadow-xs rounded-3xl space-y-2.5">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-xs font-bold text-slate-700">
                      참여자 선택{' '}
                      <span className="text-[11px] font-medium text-slate-500">
                        {isConfirmed
                          ? '(참여자별 응답 내역 확인)'
                          : '(다른 기기에서도 본인 이름을 눌러 수정·삭제)'}
                      </span>
                    </span>
                    {!isConfirmed && (
                      <button
                        type="button"
                        onClick={() => {
                          setMyVote(null);
                          setShowVoteForm(true);
                        }}
                        className="px-2.5 py-1 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>다른 이름으로 투표하기</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {votes.map((v) => {
                      const isSelected = myVote?.id === v.id;
                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => handleSelectVote(v, false)}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                            isSelected
                              ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                              : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                          }`}
                        >
                          {v.nickname}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {isVoted && !showVoteForm ? (
                <div className="sys-card p-5 border-emerald-200 bg-emerald-50/60 space-y-3 shadow-sm rounded-3xl">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0 shadow-sm">
                      <Check className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900">
                        {myVote?.nickname}님의 투표 내역
                      </h3>
                      <p className="text-xs text-slate-600 mt-0.5">
                        {isConfirmed
                          ? '이미 확정된 모임방으로 투표를 더 이상 변경할 수 없습니다.'
                          : '아래에서 최적 날짜 결과를 확인하거나 초대 링크를 친구에게 공유해보세요.'}
                      </p>
                    </div>
                  </div>

                  {!isConfirmed && isSelectedLegacyPasswordless && (
                    <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed">
                      비밀번호 없이 등록된 이전 투표입니다. 내용을 수정하려면 먼저 삭제한 뒤 숫자 4자리 비밀번호를 설정해 다시 투표해 주세요.
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-2 border-t border-emerald-100 flex-wrap">
                    <MultiShareButton
                      title={room.title}
                      url={shareUrl}
                      confirmedDate={isConfirmed && room.confirmed_date ? room.confirmed_date : undefined}
                      className="flex-1 py-2.5"
                    />

                    {!isConfirmed && !isSelectedLegacyPasswordless && (
                      <button
                        type="button"
                        onClick={() => setShowVoteForm(true)}
                        className="px-3 py-2.5 rounded-2xl bg-white text-slate-700 hover:bg-slate-100 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer border border-slate-200"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>수정</span>
                      </button>
                    )}

                    {!isConfirmed && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setDeletePin('');
                            setDeleteErrorMsg('');
                            setShowDeleteModal(true);
                          }}
                          className="px-3 py-2.5 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                          <span>삭제</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setMyVote(null);
                            setShowVoteForm(true);
                          }}
                          className="px-3 py-2.5 rounded-2xl bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>다른 이름으로 투표</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ) : isConfirmed ? (
                <div className="sys-card p-5 border-slate-200 bg-slate-50 text-center space-y-1.5 rounded-3xl">
                  <p className="text-sm font-black text-slate-900">투표가 마감된 모임방입니다.</p>
                  <p className="text-xs text-slate-600">
                    상단 카드에서 최종 확정된 일정을 확인하거나 위 참여자 목록에서 응답을 조회할 수 있습니다.
                  </p>
                </div>
              ) : (
                <div id="vote-form-section">
                  <GuestVoteForm
                    key={myVote?.id ?? 'new-vote'}
                    room={room}
                    existingVote={myVote}
                    existingVotes={votes}
                    onSelectExistingVote={(v) => handleSelectVote(v, true)}
                    onInspectExistingVote={(v) => handleSelectVote(v, false)}
                    onSubmitVote={handleSubmitVote}
                    onCancel={
                      isVoted
                        ? () => setShowVoteForm(false)
                        : fallbackSavedVote
                        ? () => {
                            setMyVote(fallbackSavedVote);
                            setShowVoteForm(false);
                          }
                        : undefined
                    }
                  />
                </div>
              )}
            </div>
          )}
        </section>

        {/* SECTION 3: 최적 약속 날짜 추천 */}
        <section className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              <span>STEP 3 · 최적 약속 날짜 추천</span>
            </span>
          </div>

          <GoldenDateCard
            heatmapData={heatmapMap}
            totalVoters={totalVotersCount}
            onConfirmDate={handleConfirmDate}
            onShare={() => setShowShareSheet(true)}
            selectedConfirmedKey={room.confirmed_date || undefined}
            isHost={isHost}
          />
        </section>

        {/* SECTION 4: 전체 참여자 응답 현황 */}
        {totalVotersCount > 0 && (
          <section className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                <span>STEP 4 · 전체 참여자 응답 현황</span>
              </span>
            </div>

            <HeatmapGrid
              heatmapMap={heatmapMap}
              totalVotersCount={totalVotersCount}
            />
          </section>
        )}

        {/* SECTION 5: 스폰서 혜택 */}
        <section className="pt-2">
          <AdFitBanner unitId={ADFIT_ROOM_UNIT_ID} />
        </section>
      </div>

      {/* Share Modal */}
      {showShareSheet && (
        <ShareSheet room={room} onClose={() => setShowShareSheet(false)} />
      )}

      {/* Vote Delete Modal */}
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

            <div className="space-y-1 text-xs text-slate-600">
              <p className="font-bold text-slate-900">
                <strong className="text-slate-800">{myVote?.nickname}</strong>님의 투표를 삭제할까요?
              </p>
            </div>

            {deleteErrorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold">
                ⚠️ {deleteErrorMsg}
              </div>
            )}

            <form onSubmit={handleDeleteVote} className="space-y-3">
              {myVote?.has_password !== false ? (
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    수정·삭제용 비밀번호 4자리 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    inputMode="numeric"
                    pattern="\d{4}"
                    maxLength={4}
                    autoComplete="off"
                    value={deletePin}
                    onChange={(e) => {
                      setDeletePin(e.target.value.replace(/\D/g, '').slice(0, 4));
                      if (deleteErrorMsg) setDeleteErrorMsg('');
                    }}
                    placeholder="숫자 4자리"
                    className="w-full sys-input h-11 text-xs font-mono tracking-widest"
                  />
                </div>
              ) : (
                <p className="text-xs text-slate-600 bg-slate-50 border border-slate-200/80 rounded-xl p-3">
                  비밀번호 없이 생성된 이전 투표입니다. 삭제하시겠습니까?
                </p>
              )}

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
                  <span>{isDeleting ? '삭제 중...' : '투표 삭제'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Sticky Mobile CTA */}
      <div className="fixed bottom-4 left-4 right-4 z-40 sm:hidden">
        <div className="sys-card p-2 bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-xl rounded-2xl">
          {isDemoRoom ? (
            <button
              type="button"
              onClick={() => router.push('/')}
              className="w-full sys-btn-primary h-11 text-xs font-black"
            >
              새 모임방 만들기
            </button>
          ) : !isConfirmed && (!isVoted || showVoteForm) ? (
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('vote-form-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                else setShowVoteForm(true);
              }}
              className="w-full sys-btn-primary h-11 text-xs font-black flex items-center justify-center gap-1.5"
            >
              <VoteIcon className="w-4 h-4" />
              <span>내 가능 날짜 선택하기</span>
            </button>
          ) : (
            <MultiShareButton
              title={room.title}
              url={shareUrl}
              confirmedDate={isConfirmed && room.confirmed_date ? room.confirmed_date : undefined}
              className="w-full h-11"
            />
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
