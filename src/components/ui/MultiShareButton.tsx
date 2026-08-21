'use client';

import React, { useState } from 'react';
import { Share2, Check, Copy, MessageCircle } from 'lucide-react';
import { trackRoomShare } from '@/lib/gtag';

interface MultiShareButtonProps {
  title: string;
  description?: string;
  url: string;
  confirmedDate?: string;
  className?: string;
}

export const MultiShareButton: React.FC<MultiShareButtonProps> = ({
  title,
  description = '모여잇에서 친구들과 5초 만에 약속 날짜를 정해보세요!',
  url,
  confirmedDate,
  className = '',
}) => {
  const [copied, setCopied] = useState(false);
  const [showUrlModal, setShowUrlModal] = useState(false);

  const shareText = confirmedDate
    ? `🎉 [모여잇] '${title}' 모임 날짜가 ${confirmedDate}(으)로 최종 확정되었습니다!`
    : `🗓️ [모여잇] '${title}' 모임 약속 날짜를 함께 정해요!`;

  const handleShare = async () => {
    // 1. Try KakaoTalk Share if Kakao SDK is initialized
    if (typeof window !== 'undefined' && (window as any).Kakao && (window as any).Kakao.Share) {
      try {
        (window as any).Kakao.Share.sendDefault({
          objectType: 'feed',
          content: {
            title: shareText,
            description,
            imageUrl: `${window.location.origin}/api/og?title=${encodeURIComponent(title)}`,
            link: {
              mobileWebUrl: url,
              webUrl: url,
            },
          },
          buttons: [
            {
              title: confirmedDate ? '확정 결과 확인하기' : '5초 만에 가능 날짜 투표하기',
              link: {
                mobileWebUrl: url,
                webUrl: url,
              },
            },
          ],
        });
        trackRoomShare('kakao');
        return;
      } catch (e) {
        console.warn('Kakao share fallback to Web Share / Clipboard:', e);
      }
    }

    // 2. Try Native Web Share API
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: shareText,
          text: shareText,
          url,
        });
        trackRoomShare('web_share');
        return;
      } catch (e) {
        // User cancelled or share failed
      }
    }

    // 3. Try Clipboard API
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
        trackRoomShare('clipboard');
        return;
      } catch (e) {
        console.warn('Clipboard write failed:', e);
      }
    }

    // 4. Fallback: Manual URL Modal
    setShowUrlModal(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleShare}
        className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs sm:text-sm shadow-md transition-all cursor-pointer ${className}`}
      >
        {copied ? (
          <>
            <Check className="w-4 h-4 text-emerald-300" />
            <span>초대 링크 복사 완료!</span>
          </>
        ) : (
          <>
            <Share2 className="w-4 h-4" />
            <span>{confirmedDate ? '확정 결과 카톡/링크 공유하기' : '초대 링크 복사 & 공유하기'}</span>
          </>
        )}
      </button>

      {/* Manual URL Display Modal */}
      {showUrlModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-slate-200">
            <h3 className="text-base font-black text-slate-900">초대 링크 공유하기</h3>
            <p className="text-xs text-slate-500">
              아래 링크를 복사하여 카카오톡 단톡방이나 메시지로 친구들에게 전송해 주세요.
            </p>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-2">
              <input
                type="text"
                readOnly
                value={url}
                className="bg-transparent text-xs text-slate-700 font-mono w-full outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(url);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2500);
                  trackRoomShare('clipboard');
                }}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-extrabold flex items-center gap-1 shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? '복사됨' : '복사'}</span>
              </button>
            </div>
            <button
              type="button"
              onClick={() => setShowUrlModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-extrabold hover:bg-slate-200 transition-all"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </>
  );
};
