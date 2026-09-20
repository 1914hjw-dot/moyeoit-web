'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Bell, Pin, Calendar, AlertCircle } from 'lucide-react';
import { Footer } from '@/components/ui/Footer';
import { Notice } from '@/types/feedback';

export default function NoticeDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [notice, setNotice] = useState<Notice | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;

    async function fetchNotice() {
      try {
        const res = await fetch(`/api/notices/${id}`);
        if (res.status === 404) {
          setNotFound(true);
          return;
        }
        const data = await res.json();
        if (data.success && data.notice) {
          setNotice(data.notice);
        } else {
          setNotFound(true);
        }
      } catch (err) {
        console.warn('Failed to load notice:', err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }

    fetchNotice();
  }, [id]);

  return (
    <main className="min-h-screen max-w-4xl mx-auto px-4 py-6 space-y-8">
      {/* Header */}
      <header className="flex items-center justify-between pb-3 border-b border-slate-200/80">
        <Link
          href="/notices"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>공지사항 목록으로</span>
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xs shadow-sm">
            <Bell className="w-4 h-4" />
          </div>
          <span className="text-xs font-black text-slate-900">공지사항</span>
        </div>
      </header>

      {/* Main Content */}
      <article className="sys-card p-6 sm:p-10 space-y-6 bg-white border-slate-200/80 shadow-xl shadow-slate-200/50 rounded-3xl">
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400">
            공지사항을 불러오는 중입니다...
          </div>
        ) : notFound || !notice ? (
          <div className="py-20 text-center space-y-4">
            <AlertCircle className="w-10 h-10 text-slate-300 mx-auto" />
            <div className="space-y-1">
              <h1 className="text-base font-black text-slate-900">
                공지사항을 찾을 수 없습니다.
              </h1>
              <p className="text-xs text-slate-400">
                삭제되었거나 비공개 처리된 공지사항입니다.
              </p>
            </div>
            <Link
              href="/notices"
              className="inline-flex items-center gap-1.5 sys-btn-primary px-5 h-10 text-xs font-bold"
            >
              <span>공지사항 목록으로 돌아가기</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Title & Meta */}
            <div className="space-y-3 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-2">
                {notice.is_pinned && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-black">
                    <Pin className="w-3.5 h-3.5 text-indigo-600" />
                    <span>중요 공지</span>
                  </span>
                )}
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    {new Date(notice.published_at || notice.created_at).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
                {notice.title}
              </h1>
            </div>

            {/* Body Content (Escaped React text rendering, NO dangerouslySetInnerHTML) */}
            <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">
              {notice.content}
            </div>

            {/* Bottom Actions */}
            <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
              <Link
                href="/notices"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>목록으로 돌아가기</span>
              </Link>
            </div>
          </div>
        )}
      </article>

      <Footer />
    </main>
  );
}
