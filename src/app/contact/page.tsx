'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, ShieldCheck, Bug, MessageSquare, CheckCircle2, ArrowRight } from 'lucide-react';
import { Footer } from '@/components/ui/Footer';

export default function ContactPage() {
  return (
    <main className="min-h-screen max-w-4xl mx-auto px-4 py-6 space-y-8">
      {/* Header Navigation */}
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
            <Mail className="w-4 h-4" />
          </div>
          <span className="text-xs font-black text-slate-900">문의하기</span>
        </div>
      </header>

      {/* Main Content Article */}
      <article className="sys-card p-6 sm:p-10 space-y-8 bg-white border-slate-200/80 shadow-xl shadow-slate-200/50 rounded-3xl">
        <div className="space-y-3 pb-6 border-b border-slate-100">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-extrabold shadow-xs">
            <Mail className="w-4 h-4 text-slate-800" />
            <span>Contact & Support</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            모여잇 고객지원 및 문의하기
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-semibold leading-relaxed">
            서비스 이용 관련 불편사항, 개인정보 관련 문의 및 삭제 요청, 제휴 및 버그 제보는 공식 문의 메일로 연락해 주세요.
          </p>
        </div>

        {/* Contact Channels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Channel 1: Unified Support & Privacy */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                <MessageSquare className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-extrabold text-slate-900">1. 문의 및 고객지원</h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                서비스 이용 안내, 개인정보 열람·삭제 요청 및 일반 고객지원 통합 창구입니다.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-200/60">
              <a
                href="mailto:j64118637@gmail.com"
                className="text-xs font-bold text-indigo-600 hover:underline break-all block"
              >
                j64118637@gmail.com
              </a>
            </div>
          </div>

          {/* Channel 2: Partnership & Suggestions */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-extrabold text-slate-900">2. 제휴 & 기능 제안</h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                광고, 마케팅 제휴 및 모여잇 서비스 신규 기능 아이디어 제안 창구입니다.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-200/60">
              <a
                href="mailto:j64118637@gmail.com"
                className="text-xs font-bold text-emerald-700 hover:underline break-all block"
              >
                j64118637@gmail.com
              </a>
            </div>
          </div>

          {/* Channel 3: Bug Report */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                <Bug className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-extrabold text-slate-900">3. 버그 제보 & 장애 접수</h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                화면 오류, 링크 연결 문제, 투표 장애 등 기술적 불편사항 접수 창구입니다.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-200/60">
              <a
                href="mailto:j64118637@gmail.com"
                className="text-xs font-bold text-rose-600 hover:underline break-all block"
              >
                j64118637@gmail.com
              </a>
            </div>
          </div>
        </div>

        {/* Operating Hours Info */}
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs text-slate-600 leading-relaxed">
          <h3 className="font-extrabold text-slate-900 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>운영진 안내 사항</span>
          </h3>
          <p>
            • 보내주신 문의사항은 영업일 기준 24시간 이내(평일 10:00~18:00)에 신속히 답변해 드립니다.
          </p>
          <p>
            • 투표 삭제 문의 시 해당 모임방 링크와 투표 닉네임을 함께 기재해 주시면 더욱 빠른 처리가 가능합니다.
          </p>
        </div>

        {/* Footer Navigation */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs font-bold text-slate-600">
          <Link href="/help" className="hover:text-slate-900 flex items-center gap-1">
            <span>이용 도움말 센터로 가기</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link href="/about" className="hover:text-slate-900 flex items-center gap-1">
            <span>서비스 소개 보러가기</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </article>

      <Footer />
    </main>
  );
}
