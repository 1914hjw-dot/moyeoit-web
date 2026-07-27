'use client';

import React, { useState } from 'react';
import { Room } from '@/types/schema';
import { Copy, Check, X, Share2, ExternalLink } from 'lucide-react';

interface ShareSheetProps {
  room: Room;
  onClose: () => void;
}

export const ShareSheet: React.FC<ShareSheetProps> = ({ room, onClose }) => {
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/room/${room.id}` : '';

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const input = document.createElement('input');
        input.value = shareUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `[모여잇] ${room.title}`,
          text: room.description || '약속 날짜를 투표해 주세요!',
          url: shareUrl,
        });
      } catch (e) {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm transition-all">
      <div className="w-full sm:max-w-md bg-white border border-slate-200 rounded-t-3xl sm:rounded-3xl p-6 space-y-5 shadow-2xl animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-slate-800" />
            <h3 className="text-base font-black text-slate-900">초대 링크 공유하기</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Card Title Preview */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
          <p className="text-xs font-bold text-slate-800">{room.title}</p>
          <p className="text-[11px] text-slate-400 truncate">{shareUrl}</p>
        </div>

        {/* Share Action Buttons */}
        <div className="space-y-2.5">
          {/* Primary Action: Link Copy (Slate 900) */}
          <button
            type="button"
            onClick={handleCopyLink}
            className={`w-full h-12 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
              copied
                ? 'bg-emerald-600 text-white shadow-emerald-600/20'
                : 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/10'
            }`}
          >
            {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4 text-white" />}
            <span>{copied ? '초대 링크가 복사되었습니다!' : '초대 링크 복사하기'}</span>
          </button>

          {/* Secondary Action: Native System Share */}
          <button
            type="button"
            onClick={handleNativeShare}
            className="w-full h-11 rounded-2xl bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>기타 앱으로 공유 (시스템 공유)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
