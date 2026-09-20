'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Megaphone, ChevronRight } from 'lucide-react';
import { Notice } from '@/types/feedback';

export const NoticeBanner: React.FC = () => {
  const [notice, setNotice] = useState<Notice | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchPinnedNotice() {
      try {
        const res = await fetch('/api/notices?pinned=true');
        if (!res.ok) return;
        const data = await res.json();
        if (isMounted && data.success && data.notice) {
          setNotice(data.notice);
        }
      } catch (err) {
        // Failure isolation: log warning and keep notice as null
        console.warn('Notice banner fetch error (graceful fallback):', err);
      }
    }

    fetchPinnedNotice();

    return () => {
      isMounted = false;
    };
  }, []);

  if (!notice) {
    return null;
  }

  return (
    <aside aria-label="최신 중요 공지사항" className="w-full">
      <Link
        href={`/notices/${notice.id}`}
        className="group flex items-center justify-between gap-2 px-3.5 py-2 rounded-2xl bg-indigo-50/80 hover:bg-indigo-100/80 border border-indigo-100 text-indigo-950 transition-all cursor-pointer shadow-xs"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-5 h-5 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
            <Megaphone className="w-3 h-3" />
          </span>
          <span className="text-[11px] font-black text-indigo-700 shrink-0">
            [공지]
          </span>
          <p className="text-xs font-bold truncate group-hover:text-indigo-900">
            {notice.title}
          </p>
        </div>

        <ChevronRight className="w-3.5 h-3.5 text-indigo-400 group-hover:text-indigo-700 shrink-0 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </aside>
  );
};
