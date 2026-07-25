'use client';

import React, { useState } from 'react';
import { Share2, Copy, Check, MessageCircle, QrCode, Sparkles } from 'lucide-react';
import { Room } from '@/types/schema';

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
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      setCopied(true);
    }
  };

  const handleKakaoShare = () => {
    // Kakao share fallback / web share API
    if (navigator.share) {
      navigator
        .share({
          title: room.title,
          text: `[모여잇] ${room.title} 날짜 조율 투표에 참여해 주세요!`,
          url: shareUrl,
        })
        .catch(() => {});
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="w-full glass-card rounded-2xl p-5 border border-purple-500/30 my-6 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white">
              🚀 모임원에게 1초 초대 공유하기
            </h3>
            <p className="text-xs text-purple-300">
              링크를 카카오톡 단톡방에 보낼 경우 예쁜 카드와 함께 실시간 투표가 연동됩니다.
            </p>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-gray-400 hover:text-white px-2 py-1"
          >
            ✕
          </button>
        )}
      </div>

      {/* Kakao OG Card Preview */}
      <div className="p-4 rounded-xl glass-card border border-purple-400/30 bg-gradient-to-br from-purple-900/40 via-violet-950/60 to-black space-y-2">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-300">
          <Sparkles className="w-3.5 h-3.5" />
          <span>카카오톡 썸네일 예시</span>
        </div>
        <div className="p-3 rounded-lg bg-black/60 border border-purple-500/20">
          <p className="text-xs font-bold text-white">📅 {room.title}</p>
          <p className="text-[11px] text-purple-300 mt-1">
            "로그인 0초, 10초 만에 가능 날짜를 투표해 주세요!"
          </p>
          <div className="mt-2 pt-2 border-t border-purple-500/10 flex items-center justify-between text-[10px] text-amber-400 font-semibold">
            <span>Moyeoit • 5초 날짜 조율기</span>
            <span>투표하러 가기 →</span>
          </div>
        </div>
      </div>

      {/* Share Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={handleKakaoShare}
          className="py-3 px-4 rounded-xl bg-amber-400 text-black hover:bg-amber-300 font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all transform active:scale-95"
        >
          <MessageCircle className="w-4 h-4 fill-black" />
          <span>카카오톡 단톡방에 공유하기</span>
        </button>

        <button
          type="button"
          onClick={handleCopyLink}
          className="py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 transition-all transform active:scale-95"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? '초대 링크가 복사되었습니다!' : '초대 링크 복사'}</span>
        </button>
      </div>

      {/* Link Input Preview */}
      <div className="relative">
        <input
          type="text"
          readOnly
          value={shareUrl}
          className="w-full px-3.5 py-2 rounded-xl bg-purple-950/60 border border-purple-500/20 text-purple-300 text-xs font-mono select-all focus:outline-none"
        />
      </div>
    </div>
  );
};
