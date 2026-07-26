'use client';

import React, { useState } from 'react';
import { Room } from '@/types/schema';
import { Copy, Check, MessageCircle, X, Share2, ExternalLink } from 'lucide-react';

interface ShareSheetProps {
  room: Room;
  onClose: () => void;
}

export const ShareSheet: React.FC<ShareSheetProps> = ({ room, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [shareMsg, setShareMsg] = useState('');

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/room/${room.id}` : '';
  const ogImageUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/api/og?title=${encodeURIComponent(room.title)}`
    : '';

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        // Fallback for older browsers
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

  const handleKakaoShare = () => {
    setShareMsg('');
    try {
      if (typeof window !== 'undefined' && (window as any).Kakao) {
        const kakao = (window as any).Kakao;

        // Initialize Kakao SDK if not already initialized
        if (!kakao.isInitialized()) {
          const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY || '';
          if (kakaoKey) {
            kakao.init(kakaoKey);
          }
        }

        if (kakao.isInitialized() && kakao.Share) {
          kakao.Share.sendDefault({
            objectType: 'feed',
            content: {
              title: `[모여잇] ${room.title}`,
              description: room.description || '친구들과 가능 날짜를 10초 만에 정해보세요!',
              imageUrl: ogImageUrl,
              link: {
                mobileWebUrl: shareUrl,
                webUrl: shareUrl,
              },
            },
            buttons: [
              {
                title: '약속 날짜 투표하기',
                link: {
                  mobileWebUrl: shareUrl,
                  webUrl: shareUrl,
                },
              },
            ],
          });
          return;
        }
      }

      // Fallback if Kakao SDK is not available or fails to initialize
      handleCopyLink();
      setShareMsg('카카오톡 연결을 위해 초대 링크가 복사되었습니다!');
      setTimeout(() => setShareMsg(''), 3000);
    } catch (err) {
      console.error('Kakao share error:', err);
      handleCopyLink();
      setShareMsg('초대 링크가 복사되었습니다!');
      setTimeout(() => setShareMsg(''), 3000);
    }
  };

  const handleNativeShare = async () => {
    setShareMsg('');
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `[모여잇] ${room.title}`,
          text: room.description || '약속 날짜를 투표해 주세요!',
          url: shareUrl,
        });
      } catch (e) {
        // Fallback to copy link if user cancels or native share fails
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-zinc-950/80 backdrop-blur-sm transition-all">
      <div className="w-full sm:max-w-md bg-zinc-900 border border-zinc-800 rounded-t-3xl sm:rounded-3xl p-6 space-y-6 shadow-2xl animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-amber-400" />
            <h3 className="text-base font-extrabold text-zinc-100">초대 링크 공유하기</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Card Title Preview */}
        <div className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-1">
          <p className="text-xs font-bold text-zinc-300">{room.title}</p>
          <p className="text-[11px] text-zinc-500 truncate">{shareUrl}</p>
        </div>

        {shareMsg && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold text-center animate-in fade-in">
            ✨ {shareMsg}
          </div>
        )}

        {/* Share Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleKakaoShare}
            className="p-4 rounded-2xl bg-[#FEE500] text-[#000000] font-extrabold text-xs flex flex-col items-center justify-center gap-2 hover:opacity-95 transition-all cursor-pointer shadow-sm"
          >
            <MessageCircle className="w-5 h-5 fill-current text-zinc-950" />
            <span>카카오톡 공유</span>
          </button>

          <button
            type="button"
            onClick={handleCopyLink}
            className={`p-4 rounded-2xl font-extrabold text-xs flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
              copied
                ? 'bg-emerald-500 text-zinc-950'
                : 'bg-zinc-800 text-zinc-100 hover:bg-zinc-700 border border-zinc-700'
            }`}
          >
            {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            <span>{copied ? '복사되었습니다!' : '링크 복사'}</span>
          </button>
        </div>

        {/* System Share Option */}
        <button
          type="button"
          onClick={handleNativeShare}
          className="w-full py-3 rounded-xl bg-zinc-950 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>기타 앱으로 공유 (시스템 공유)</span>
        </button>
      </div>
    </div>
  );
};
