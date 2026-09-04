'use client';

import React, { useState } from 'react';
import { Share2, Copy, Check, MessageCircle, Sparkles, Send, Users } from 'lucide-react';
import { Room } from '@/types/schema';
import { trackRoomShare } from '@/lib/gtag';

interface ShareModalProps {
  room: Room;
  onClose?: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ room, onClose }) => {
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/room/${room.id}` : '';

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      trackRoomShare('clipboard');
    } catch {
      setCopied(true);
    }
  };

  const handleKakaoShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `📅 ${room.title}`,
          text: `[모여잇] ${room.title} 모임의 가능한 날짜 투표에 참여해 주세요. 회원가입 없이 응답할 수 있어요.`,
          url: shareUrl,
        })
        .then(() => trackRoomShare('web_share'))
        .catch(() => {});
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="w-full sys-card p-5 sm:p-6 my-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border-subtle)]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Share2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-zinc-100">
              초대 링크 공유하기
            </h3>
            <p className="text-xs text-zinc-400">
              이 링크를 단톡방에 공유하면 친구들이 가능한 날짜에 응답할 수 있습니다.
            </p>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-zinc-500 hover:text-zinc-200 px-2 py-1 cursor-pointer"
          >
            ✕ 닫기
          </button>
        )}
      </div>

      {/* Copy Success Feedback Toast Notification */}
      {copied && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-150">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>링크가 복사되었어요! 카카오톡 단톡방에 [붙여넣기]를 해주세요 📋</span>
        </div>
      )}

      {/* Live KakaoTalk Thumbnail Preview */}
      <div className="p-4 rounded-xl bg-zinc-950/90 border border-[var(--color-border-subtle)] space-y-2.5">
        <div className="flex items-center justify-between text-[11px] font-semibold text-amber-300">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>친구 단톡방에 보여질 카드 미리보기</span>
          </span>
          <span className="text-[10px] text-zinc-500">자동 세팅됨</span>
        </div>

        <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-extrabold text-zinc-100">
            <span>📅 {room.title}</span>
          </div>
          <p className="text-[11px] text-zinc-400">
            {room.description || '회원가입 없이 가능한 날짜에 투표해 주세요.'}
          </p>
          <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[10px] text-amber-400 font-bold">
            <span>Moyeoit • 약속 날짜 조율</span>
            <span className="flex items-center gap-0.5">
              <span>투표하러 가기</span>
              <Send className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>

      {/* Sharing CTA Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={handleKakaoShare}
          className="h-11 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
        >
          <MessageCircle className="w-4 h-4 fill-zinc-950" />
          <span>카카오톡으로 초대 보내기</span>
        </button>

        <button
          type="button"
          onClick={handleCopyLink}
          className={`h-11 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            copied
              ? 'bg-emerald-500 text-zinc-950 font-black'
              : 'sys-btn-primary'
          }`}
        >
          {copied ? <Check className="w-4 h-4 text-zinc-950" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? '복사 완료!' : '초대 링크 복사하기'}</span>
        </button>
      </div>

      {/* Post-Share Next Guidance Box */}
      <div className="p-3.5 rounded-xl bg-zinc-900/50 border border-[var(--color-border-subtle)] text-xs text-zinc-400 flex items-start gap-2.5">
        <Users className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-bold text-zinc-200">다음 순서 안내:</p>
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            친구들이 링크를 타고 들어와 가능 날짜를 선택하면, <strong className="text-emerald-400 font-bold">전원 참석 가능한 최적의 날짜 TOP 3와 컬러 히트맵</strong>이 여기에 자동으로 실시간 계산되어 나타납니다.
          </p>
        </div>
      </div>
    </div>
  );
};
