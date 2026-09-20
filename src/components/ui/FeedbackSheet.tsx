'use client';

import React, { useState, useEffect, useId, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import {
  X,
  Send,
  CheckCircle2,
  AlertCircle,
  Shield,
  Loader2,
  MessageSquare,
} from 'lucide-react';
import { FeedbackCategory, FEEDBACK_CATEGORIES } from '@/types/feedback';

interface FeedbackSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeedbackSheet: React.FC<FeedbackSheetProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const titleId = useId();
  const [category, setCategory] = useState<FeedbackCategory>('일정/투표');
  const [content, setContent] = useState('');
  const [replyEmail, setReplyEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleClose = useCallback(() => {
    if (isSubmitting) return;
    setErrorMsg('');
    setIsSuccess(false);
    onClose();
  }, [isSubmitting, onClose]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, handleClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setErrorMsg('문의 내용을 입력해 주세요.');
      return;
    }
    if (content.length > 2000) {
      setErrorMsg('문의 내용은 최대 2,000자까지 입력 가능합니다.');
      return;
    }
    if (replyEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(replyEmail.trim())) {
      setErrorMsg('올바른 이메일 주소를 입력해 주세요.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          content: content.trim(),
          reply_email: replyEmail.trim() || undefined,
          page_path: pathname || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || '문의 전송에 실패했습니다. 잠시 후 다시 시도해 주세요.');
      }

      setIsSuccess(true);
      setContent('');
      setReplyEmail('');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : '문의 전송에 실패했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={() => !isSubmitting && handleClose()}
      />

      {/* Sheet / Modal Content */}
      <div
        className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200/80 p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto z-10 animate-in fade-in slide-in-from-bottom-6 sm:slide-in-from-bottom-2 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xs shadow-xs">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h2 id={titleId} className="text-base font-black text-slate-900">
                문의 및 의견 보내기
              </h2>
              <p className="text-[11px] text-slate-400">
                서비스 개선을 위한 소중한 의견을 남겨주세요.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-900">문의가 전달되었습니다.</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                보내주신 의견을 면밀히 검토하여 더 좋은 서비스가 되도록 노력하겠습니다.
              </p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="mt-4 sys-btn-primary px-6 h-10 text-xs font-bold"
            >
              확인
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Category selection */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">
                문의 유형 <span className="text-rose-500">*</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {FEEDBACK_CATEGORIES.map((cat) => {
                  const isSelected = category === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Content textarea */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">
                  문의 내용 <span className="text-rose-500">*</span>
                </label>
                <span className={`text-[11px] ${content.length > 2000 ? 'text-rose-500 font-bold' : 'text-slate-400'}`}>
                  {content.length} / 2,000자
                </span>
              </div>
              <textarea
                required
                rows={5}
                maxLength={2000}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="불편하셨던 점이나 건의사항, 버그 등을 자세히 적어주시면 빠른 해결에 큰 도움이 됩니다."
                className="w-full sys-input p-3 text-xs leading-relaxed resize-none h-32"
              />
            </div>

            {/* Reply email (optional) */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                답변 받을 이메일 <span className="text-slate-400 font-normal">(선택)</span>
              </label>
              <input
                type="email"
                value={replyEmail}
                onChange={(e) => setReplyEmail(e.target.value)}
                placeholder="example@domain.com"
                className="w-full sys-input h-10 text-xs"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                입력해 주시면 검토 후 작성하신 이메일로 답변을 전송해 드립니다.
              </p>
            </div>

            {/* Privacy notice */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-2 text-[11px] text-slate-500 leading-relaxed">
              <Shield className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                모여잇은 사용자의 위치 정보나 민감한 개인정보를 임의로 수집하지 않습니다.
              </span>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-100 flex items-center gap-2 text-xs text-rose-700 font-semibold">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="sys-btn-secondary px-4 h-11 text-xs font-bold"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="sys-btn-primary px-5 h-11 text-xs font-black flex items-center gap-1.5 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>전송 중...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5 text-white" />
                    <span>문의 접수하기</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
