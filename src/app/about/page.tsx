'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, Heart, Sparkles, CheckCircle2, Lock, PencilLine } from 'lucide-react';
import { Footer } from '@/components/ui/Footer';

export default function AboutPage() {
  return (
    <main className="min-h-screen max-w-4xl mx-auto px-4 py-6 space-y-8">
      {/* Navigation Header */}
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
            <Calendar className="w-4 h-4" />
          </div>
          <span className="text-xs font-black text-slate-900">서비스 소개</span>
        </div>
      </header>

      {/* Main Content Article */}
      <article className="sys-card p-6 sm:p-10 space-y-10 bg-white border-slate-200/80 shadow-xl shadow-slate-200/50 rounded-3xl">
        {/* Title Header */}
        <div className="space-y-3 pb-6 border-b border-slate-100">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-extrabold shadow-xs">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Story & Philosophy</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            단톡방 피로도 없는 약속 조율,<br />모여잇이 만들어 갑니다.
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-semibold leading-relaxed">
            “언제 만날까?” 한 마디로 시작된 수많은 메시지의 피로감에서 벗어나세요.
          </p>
        </div>

        {/* Section 1: Why We Built It */}
        <section className="space-y-4">
          <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500" />
            <span>1. 모여잇을 만든 이유</span>
          </h2>
          <div className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
            <p>
              우리는 동아리 정기 스터디, 친구들과의 주말 약속, 회사 팀 회식을 잡을 때마다 <strong>카카오톡 단톡방에서 무수한 메시지와 끝없는 대화</strong>를 나누어야 했습니다. 단톡방 투표 기능을 이용해도 일일이 인원을 대조해야 하고, 전원이 참석할 수 있는 최적의 황금 날짜를 한눈에 발견하기 어려웠습니다.
            </p>
            <p>
              해외의 비회원 일정 조율 서비스인 When2meet이나 Doodle 등이 존재하지만, 한국어 사용자에게 맞지 않는 복잡한 UI와 모바일 카카오톡 단톡방 환경에서의 불편함이 존재했습니다.
            </p>
            <p>
              <strong>모여잇(Moyeoit)</strong>은 복잡한 가입 절차 없이 <strong>링크 하나로 단톡방 친구들이 가능한 날짜에 응답하고 함께 약속 후보를 비교</strong>할 수 있도록 개발되었습니다.
            </p>
          </div>
        </section>

        <hr className="border-slate-100" />

        {/* Section 2: Core Philosophy */}
        <section className="space-y-4">
          <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>2. 모여잇의 3대 핵심 철학</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <span className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                01
              </span>
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">회원가입 없는 간편한 참여</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                로그인, 회원가입, 비밀번호 재설정 없이 초대 링크에서 바로 투표할 수 있습니다.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <span className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                02
              </span>
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">명확한 데이터 시각화</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                복잡한 수치 대신 TOP 3 추천 날짜와 컬러 히트맵으로 가장 참석률이 높고 최선의 모임 일자를 한눈에 보여드립니다.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <span className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                03
              </span>
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">사용자 경험(UX) 최우선</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                모바일 카카오톡 인앱 브라우저 화면에서도 전혀 깨짐 없이 한 손으로 조작 가능한 반응형 인터페이스를 제공합니다.
              </p>
            </div>
          </div>
        </section>

        <hr className="border-slate-100" />

        {/* Section 3: Privacy Principle */}
        <section className="space-y-4">
          <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
            <Lock className="w-5 h-5 text-indigo-600" />
            <span>3. 개인정보 최소 수집 및 파기 원칙</span>
          </h2>
          <div className="p-5 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-3 text-xs sm:text-sm text-indigo-950 leading-relaxed">
            <p>
              모여잇은 이용자의 개인정보 보호를 최우선 가치로 둡니다. 우리는 주민등록번호, 연락처, 계좌번호 등 불필요한 개인정보를 <strong>절대 수집하지 않으며</strong>, 약속 투표에 필요한 최소한의 닉네임과 일정 데이터만 보관합니다.
            </p>
            <ul className="list-disc list-inside space-y-1 font-semibold text-indigo-900">
              <li>모임방과 투표 데이터는 <strong>생성일로부터 90일 후 자동 삭제</strong>됩니다.</li>
              <li>투표 수정 비밀번호(PIN)는 단방향 암호화 해시 알고리즘으로 안전하게 관리됩니다.</li>
            </ul>
          </div>
        </section>

        <hr className="border-slate-100" />

        <section className="space-y-4">
          <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
            <PencilLine className="w-5 h-5 text-amber-600" />
            <span>4. 가이드는 누가, 어떻게 작성하나요?</span>
          </h2>
          <div className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
            <p>
              모여잇 가이드는 <strong>모여잇 팀</strong> 명의로 제공하는 서비스 이용 안내입니다.
              기능 설명과 모임 운영 제안을 구분하며, 인원·금액·메시지는 실제 이용 사례가 아닌
              설명용 가상 예시로 표시합니다. 출처를 확인할 수 없는 효과 수치는 사용하지 않습니다.
            </p>
            <p>
              기능이나 개인정보 처리 방식이 바뀌면 관련 가이드의 본문과 최종 수정일을 함께
              갱신합니다. 내용 오류나 보완 의견은 문의 페이지로 알려주시면 실제 동작을 다시 확인한 뒤
              반영합니다.
            </p>
          </div>
          <Link
            href="/guide"
            className="inline-flex items-center gap-1.5 text-xs font-black text-indigo-700 hover:text-indigo-900"
          >
            편집 원칙이 적용된 가이드 보기
            <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
          </Link>
        </section>

        {/* Internal Navigation Links */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs font-bold text-slate-600">
          <Link href="/help" className="hover:text-slate-900 flex items-center gap-1">
            <span>이용 도움말 보러가기</span>
            <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
          </Link>
          <Link href="/contact" className="hover:text-slate-900 flex items-center gap-1">
            <span>운영진에게 문의하기</span>
            <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
          </Link>
        </div>
      </article>

      <Footer />
    </main>
  );
}
