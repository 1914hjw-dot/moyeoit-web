'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, HelpCircle, Calendar, Share2, CheckCircle2, Edit3, AlertTriangle, ArrowRight } from 'lucide-react';
import { Footer } from '@/components/ui/Footer';

export default function HelpPage() {
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
            <HelpCircle className="w-4 h-4" />
          </div>
          <span className="text-xs font-black text-slate-900">도움말 센터</span>
        </div>
      </header>

      {/* Main Content Article */}
      <article className="sys-card p-6 sm:p-10 space-y-10 bg-white border-slate-200/80 shadow-xl shadow-slate-200/50 rounded-3xl">
        <div className="space-y-3 pb-6 border-b border-slate-100">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-extrabold shadow-xs">
            <HelpCircle className="w-4 h-4 text-slate-800" />
            <span>User Guide & Support</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            모여잇 이용 안내 및 문제 해결 센터
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-semibold leading-relaxed">
            방 생성부터 카톡 공유, 투표 수정/삭제 및 자주 발생하는 문제 해결 방법을 상세히 안내해 드립니다.
          </p>
        </div>

        {/* Section 1: Creating Room */}
        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            <span>1. 약속 방 생성하기</span>
          </h2>
          <div className="space-y-2 text-xs sm:text-sm text-slate-600 leading-relaxed pl-2 border-l-2 border-indigo-200">
            <p>① 메인 페이지에서 모임 제목(예: 7월 스터디 모임)을 입력합니다.</p>
            <p>② 조율 방식(날짜만 조율 또는 날짜 + 시간대 지정)을 선택합니다.</p>
            <p>③ 달력에서 약속 후보 날짜들을 클릭하여 지정합니다 (이번 달 주말 전체 선택 기능 포함).</p>
            <p>④ [약속 방 만들기] 버튼을 누르면 즉시 고유한 초대 링크가 발급됩니다.</p>
          </div>
        </section>

        <hr className="border-slate-100" />

        {/* Section 2: Sharing Link */}
        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
            <Share2 className="w-5 h-5 text-indigo-600" />
            <span>2. 초대 링크 공유 및 친구 참여</span>
          </h2>
          <div className="space-y-2 text-xs sm:text-sm text-slate-600 leading-relaxed pl-2 border-l-2 border-indigo-200">
            <p>① 생성된 약속방 상단의 [초대 링크 복사하기] 버튼을 누릅니다.</p>
            <p>② 카카오톡 단톡방이나 문자 메시지창에 링크를 붙여넣어 친구들에게 전달합니다.</p>
            <p>③ 링크를 클릭한 친구들은 로그인 없이 이름/닉네임만 입력하고 5초 만에 투표를 완료할 수 있습니다.</p>
          </div>
        </section>

        <hr className="border-slate-100" />

        {/* Section 3: Voting & Results */}
        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>3. 투표 및 최적 날짜 결과 확인</span>
          </h2>
          <div className="space-y-2 text-xs sm:text-sm text-slate-600 leading-relaxed pl-2 border-l-2 border-emerald-200">
            <p>① 투표 화면의 달력에서 안 되는 날짜만 눌러 [불가] 또는 [미정]으로 해제합니다.</p>
            <p>② 투표 제출 완료 즉시 전원 참여 가능한 1위 최적 황금 날짜가 계산되어 표출됩니다.</p>
            <p>③ [전체 참여자 응답 현황(히트맵)]을 클릭하면 일자별 참석 가능 명단을 한눈에 파악할 수 있습니다.</p>
          </div>
        </section>

        <hr className="border-slate-100" />

        {/* Section 4: Edit & Delete */}
        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-indigo-600" />
            <span>4. 내 투표 내역 수정 및 삭제</span>
          </h2>
          <div className="space-y-2 text-xs sm:text-sm text-slate-600 leading-relaxed pl-2 border-l-2 border-indigo-200">
            <p>① 투표 완료 후 상단에 표시되는 내 투표 완료 카드에서 [수정] 또는 [삭제] 버튼을 누릅니다.</p>
            <p>② 투표 작성 시 설정해 두었던 4자리 PIN 비밀번호를 입력하면 내 투표를 즉시 변경하거나 삭제할 수 있습니다.</p>
          </div>
        </section>

        <hr className="border-slate-100" />

        {/* Section 5: Troubleshooting */}
        <section className="space-y-4">
          <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-500" />
            <span>5. 자주 발생하는 문제 해결 (Troubleshooting)</span>
          </h2>

          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">Q. 수정용 PIN 비밀번호를 잊어버렸어요.</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                개인정보 보호를 위해 PIN 비밀번호는 원문이 아닌 단방향 해시로만 저장됩니다. 비밀번호를 잊으신 경우 <Link href="/contact" className="text-indigo-600 underline font-bold">문의하기</Link>를 통해 본인 확인 후 운영진이 처리를 도와드립니다.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">Q. 모임방 주소(URL)를 잃어버렸어요.</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                모여잇은 회원가입이 없으므로 브라우저 방문 기록(히스토리)에서 `moyeoit-web.vercel.app/room/...`을 검색하시거나 카카오톡 단톡방에 공유했던 대화 내역에서 초대 링크를 다시 클릭하시면 바로 접속하실 수 있습니다.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">Q. 카카오톡 인앱 브라우저에서 공유가 잘 안 돼요.</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                카카오톡 오른쪽 상단의 메뉴(...) 버튼을 눌러 [다른 브라우저로 열기(사파리/크롬)]를 선택하시면 더욱 원활하게 서비스를 이용하실 수 있습니다.
              </p>
            </div>
          </div>
        </section>

        {/* Footer Navigation */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs font-bold text-slate-600">
          <Link href="/about" className="hover:text-slate-900 flex items-center gap-1">
            <span>서비스 소개 보러가기</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link href="/guide" className="hover:text-slate-900 flex items-center gap-1">
            <span>약속 가이드 센터 보러가기</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </article>

      <Footer />
    </main>
  );
}
