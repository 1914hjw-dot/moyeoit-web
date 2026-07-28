import React from 'react';
import Link from 'next/link';
import { Calendar, ShieldCheck, FileText, HelpCircle, BookOpen, Mail, Info } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full mt-16 py-10 px-4 border-t border-slate-200/80 bg-white text-slate-500 text-xs space-y-6">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-start justify-between gap-6">
        {/* Brand */}
        <div className="space-y-2 max-w-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xs shadow-xs">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <p className="font-black text-slate-900 text-xs">모여잇 (Moyeoit)</p>
              <p className="text-[11px] text-slate-400">로그인 0초 • 5초 약속 날짜 조율기</p>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            회원가입 없이 단톡방 초대 링크 하나로 친구들과 전원 참석 가능한 최적의 약속 날짜를 10초 만에 도출하는 비회원 일정 조율 플랫폼입니다.
          </p>
        </div>

        {/* Quick Links Navigation Web */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-xs font-semibold">
          {/* Column 1: 서비스 안내 */}
          <div className="space-y-2">
            <p className="font-black text-slate-900 text-[11px] uppercase tracking-wider text-slate-400">
              서비스 안내
            </p>
            <ul className="space-y-1.5 text-slate-600">
              <li>
                <Link href="/about" className="hover:text-slate-900 transition-colors flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-slate-400" />
                  <span>서비스 소개</span>
                </Link>
              </li>
              <li>
                <Link href="/help" className="hover:text-slate-900 transition-colors flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                  <span>이용 도움말</span>
                </Link>
              </li>
              <li>
                <Link href="/guide" className="hover:text-slate-900 transition-colors flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                  <span>가이드 센터</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: 고객지원 */}
          <div className="space-y-2">
            <p className="font-black text-slate-900 text-[11px] uppercase tracking-wider text-slate-400">
              고객지원
            </p>
            <ul className="space-y-1.5 text-slate-600">
              <li>
                <Link href="/contact" className="hover:text-slate-900 transition-colors flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>문의하기</span>
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-slate-900 transition-colors flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>개인정보처리방침</span>
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-slate-900 transition-colors flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span>이용약관</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: 가이드 링크 */}
          <div className="space-y-2 col-span-2 sm:col-span-1">
            <p className="font-black text-slate-900 text-[11px] uppercase tracking-wider text-slate-400">
              추천 가이드
            </p>
            <ul className="space-y-1.5 text-[11px] text-slate-500">
              <li>
                <Link href="/guide/fast-date-picker" className="hover:text-slate-900 transition-colors truncate block">
                  • 약속 날짜 빠르게 정하기
                </Link>
              </li>
              <li>
                <Link href="/guide/company-dinner" className="hover:text-slate-900 transition-colors truncate block">
                  • 회식 일정 조율 노하우
                </Link>
              </li>
              <li>
                <Link href="/guide/travel-planning" className="hover:text-slate-900 transition-colors truncate block">
                  • 여행 일정 주말 조율
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto pt-4 border-t border-slate-100 text-[11px] text-slate-400 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-2">
        <p>© 2026 모여잇 (Moyeoit). All rights reserved.</p>
        <p>비회원으로 빠르게 이용할 수 있는 심플한 날짜 조율 서비스입니다.</p>
      </div>
    </footer>
  );
};
