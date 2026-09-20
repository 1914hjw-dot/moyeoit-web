'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Bell, Pin, Calendar, ChevronRight } from 'lucide-react';
import { Footer } from '@/components/ui/Footer';
import { Notice } from '@/types/feedback';

export default function NoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNotices() {
      try {
        const res = await fetch('/api/notices');
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.notices)) {
            setNotices(data.notices);
          }
        }
      } catch (err) {
        console.warn('Failed to load notices:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchNotices();
  }, []);

  return (
    <main className="min-h-screen max-w-4xl mx-auto px-4 py-6 space-y-8">
      {/* Header */}
      <header className="flex items-center justify-between pb-3 border-b border-slate-200/80">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>모여잇 홈으로</span>
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
        <div className="space-y-2 pb-6 border-b border-slate-100">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-extrabold shadow-xs">
            <Bell className="w-4 h-4 text-slate-800" />
            <span>Notice & Announcements</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            모여잇 공지사항
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-semibold leading-relaxed">
            모여잇의 최신 업데이트 소식과 기능 안내, 서비스 점검 일정 등을 안내해 드립니다.
          </p>
        </div>

        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">
            공지사항을 불러오는 중입니다...
          </div>
        ) : notices.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <Bell className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-600">등록된 공지사항이 없습니다.</p>
            <p className="text-xs text-slate-400">새로운 소식이 등록되면 이곳에 표시됩니다.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {notices.map((notice) => {
              const displayDate = notice.published_at || notice.created_at;
              const formattedDate = new Date(displayDate).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
              });

              return (
                <Link
                  key={notice.id}
                  href={`/notices/${notice.id}`}
                  className="group py-4 px-2 -mx-2 rounded-2xl hover:bg-slate-50 flex items-center justify-between gap-4 transition-all block"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {notice.is_pinned && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-700 text-[11px] font-black">
                          <Pin className="w-3 h-3 text-indigo-600" />
                          <span>중요</span>
                        </span>
                      )}
                      <h2 className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                        {notice.title}
                      </h2>
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-1">
                      {notice.content}
                    </p>

                    <div className="flex items-center gap-1 text-[11px] text-slate-400">
                      <Calendar className="w-3 h-3" />
                      <span>{formattedDate}</span>
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 shrink-0 transition-transform group-hover:translate-x-1" />
                </Link>
              );
            })}
          </div>
        )}
      </article>

      <Footer />
    </main>
  );
}
