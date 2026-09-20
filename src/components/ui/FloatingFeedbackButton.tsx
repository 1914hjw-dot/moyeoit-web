'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { MessageSquare } from 'lucide-react';
import { FeedbackSheet } from '@/components/ui/FeedbackSheet';

/**
 * Global Floating Action Button for inquiries and feedback.
 * Provides immediate discoverability across the entire service.
 *
 * Rules:
 * - Hidden on `/admin/*` routes.
 * - On `/room/[id]` on mobile, placed above the fixed bottom voting/sharing CTA (`bottom-22` vs `bottom-4`)
 *   with `z-30` so it never blocks or conflicts with core schedule coordination actions.
 * - On desktop and standard pages, positioned cleanly at `bottom-6 right-6`.
 * - Opens the existing accessible `FeedbackSheet` modal.
 */
export function FloatingFeedbackButton() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Never render floating feedback button on admin pages
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  // Check if current page has mobile bottom sticky CTA (room detail page)
  const isRoomPage = pathname?.startsWith('/room/');

  return (
    <>
      <div
        className={`fixed z-30 transition-all duration-200 ${
          isRoomPage
            ? 'bottom-22 sm:bottom-6 right-4 sm:right-6'
            : 'bottom-6 right-4 sm:right-6'
        } ${isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      >
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2 px-3.5 py-2 sm:py-2.5 rounded-full bg-white/95 backdrop-blur-md text-slate-800 border border-slate-200/90 shadow-lg hover:shadow-xl hover:border-slate-300 transition-all duration-150 cursor-pointer active:scale-95"
          aria-label="문의 및 피드백 보내기"
        >
          <span className="w-6 h-6 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:scale-105 transition-transform">
            <MessageSquare className="w-3.5 h-3.5" />
          </span>
          <span className="text-xs font-bold text-slate-700 group-hover:text-slate-900 tracking-tight">
            문의 · 피드백
          </span>
        </button>
      </div>

      <FeedbackSheet isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
