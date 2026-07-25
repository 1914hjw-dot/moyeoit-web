'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, ShieldCheck, FileText, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full mt-16 py-8 px-4 border-t border-zinc-800 bg-zinc-950/80 text-zinc-400 text-xs space-y-4">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-zinc-100 text-zinc-950 flex items-center justify-center font-bold text-xs">
            <Calendar className="w-3.5 h-3.5" />
          </div>
          <div>
            <p className="font-extrabold text-zinc-100 text-xs">모여잇 (Moyeoit)</p>
            <p className="text-[11px] text-zinc-500">로그인 0초 • 5초 약속 날짜 조율기</p>
          </div>
        </div>

        {/* Legal Links */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-medium">
          <Link
            href="/privacy"
            className="hover:text-zinc-100 transition-colors flex items-center gap-1 text-zinc-400"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>개인정보처리방침</span>
          </Link>

          <span className="text-zinc-700">•</span>

          <Link
            href="/terms"
            className="hover:text-zinc-100 transition-colors flex items-center gap-1 text-zinc-400"
          >
            <FileText className="w-3.5 h-3.5 text-zinc-400" />
            <span>이용약관</span>
          </Link>

          <span className="text-zinc-700">•</span>

          <a
            href="https://vercel.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-zinc-200 transition-colors flex items-center gap-1 text-zinc-500"
          >
            <span>Powered by Vercel</span>
            <ExternalLink className="w-3 h-3 opacity-60" />
          </a>
        </div>
      </div>

      <div className="max-w-4xl mx-auto pt-3 border-t border-zinc-900 text-[11px] text-zinc-500 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-2">
        <p>© 2026 모여잇 (Moyeoit). All rights reserved.</p>
        <p>무회원으로 빠르게 이용할 수 있는 조용한 날짜 조율 서비스입니다.</p>
      </div>
    </footer>
  );
};
