'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, HelpCircle, Calendar, Share2, CheckCircle2, AlertTriangle, ArrowRight, PartyPopper } from 'lucide-react';
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
            방 생성부터 날짜 선택 모드(기간 지정 vs 자유 날짜), 투표, 결과 확정, 카톡 공유 및 자주 발생하는 문제 해결 방법을 상세히 안내해 드립니다.
          </p>
        </div>

        {/* Section 1: Creating Room */}
        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            <span>1. 약속 방 생성하기 (2가지 날짜 방식 지원)</span>
          </h2>
          <div className="space-y-2 text-xs sm:text-sm text-slate-600 leading-relaxed pl-2 border-l-2 border-indigo-200">
            <p>① 메인 페이지에서 모임 제목(예: 8월 정기 스터디 / 주말 여행)을 입력합니다.</p>
            <p>② <strong>날짜 선택 방식</strong>을 지정합니다:</p>
            <ul className="list-disc pl-5 space-y-1 my-1 text-xs">
              <li><strong>기간 내에서 선택 (RANGE)</strong>: 방장이 지정한 기간 안에서 참여자들이 가능 날짜를 선택합니다.</li>
              <li><strong>자유 날짜 모드 (FREE)</strong>: 방장이 날짜를 제한하지 않고, 참여자들이 캘린더에서 본인이 가능한 날짜를 자유롭게 선택합니다.</li>
            </ul>
            <p>③ [약속 방 만들기] 버튼을 누르면 즉시 고유한 초대 링크가 발급됩니다.</p>
          </div>
        </section>

        <hr className="border-slate-100" />

        {/* Section 2: Sharing Link */}
        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
            <Share2 className="w-5 h-5 text-indigo-600" />
            <span>2. 초대 링크 공유 및 친구 참여 (4단계 공유 엔진)</span>
          </h2>
          <div className="space-y-2 text-xs sm:text-sm text-slate-600 leading-relaxed pl-2 border-l-2 border-indigo-200">
            <p>① 생성된 약속방 상단의 [초대 링크 복사 & 공유하기] 버튼을 누릅니다.</p>
            <p>② 모여잇은 <strong>KakaoTalk SDK ➔ Web Share API ➔ Clipboard ➔ 수동 URL 모달</strong> 4단계 자동 복구 공유 엔진을 지원합니다.</p>
            <p>③ 링크를 클릭한 친구들은 로그인 없이 닉네임만 입력하고 5초 만에 투표할 수 있습니다.</p>
          </div>
        </section>

        <hr className="border-slate-100" />

        {/* Section 3: Voting & Results */}
        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>3. 투표 및 황금 날짜 계산 (전원 가능 vs 최다 가능)</span>
          </h2>
          <div className="space-y-2 text-xs sm:text-sm text-slate-600 leading-relaxed pl-2 border-l-2 border-emerald-200">
            <p>① 참여자가 본인이 가능한 날짜를 클릭하여 제출합니다.</p>
            <p>② 모여잇 결정 엔진이 참여자 전체 응답을 실시간으로 분석합니다:</p>
            <ul className="list-disc pl-5 space-y-1 my-1 text-xs">
              <li><strong>🎉 전원 참석 가능 (ALL_AVAILABLE)</strong>: 모든 참여자가 가능한 날짜(100% 가능)가 있다면 최우선 추천합니다.</li>
              <li><strong>🥇 가장 많은 사람이 가능 (MAX_AVAILABLE)</strong>: 전원 가능한 날짜가 없다면 가장 많은 인원이 참석 가능한 날짜를 추천합니다.</li>
              <li><strong>동률 (Equal Ties)</strong>: 1위 후보 날짜가 2개 이상일 경우 모두 묶어 표출하여 방장이 선택하도록 안내합니다.</li>
            </ul>
          </div>
        </section>

        <hr className="border-slate-100" />

        {/* Section 4: Host Confirmation */}
        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
            <PartyPopper className="w-5 h-5 text-emerald-600" />
            <span>4. 방장의 최종 약속 날짜 확정</span>
          </h2>
          <div className="space-y-2 text-xs sm:text-sm text-slate-600 leading-relaxed pl-2 border-l-2 border-emerald-200">
            <p>① 추천 날짜 카드에서 방장(모임 생성 브라우저)이 [이 날짜로 모임 확정하기] 버튼을 누릅니다.</p>
            <p>② 서버에서 방장 권한(`host_secret`)을 안전하게 검증한 뒤 약속 방 상태를 `CONFIRMED`로 축하 전환합니다.</p>
            <p>③ 최종 확정 카드를 단톡방에 재공유하여 친구들에게 약속 일시를 최종 전달합니다.</p>
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
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">Q. 자유 날짜 모드에서 조율 방식이나 요일을 따로 선택해야 하나요?</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                아니요! 자유 날짜 모드에서는 방장이 요일이나 시간대를 미리 설정하지 않아도 됩니다. 참여자가 각자 캘린더에서 원하는 날짜를 직접 선택할 수 있습니다.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">Q. 수정용 PIN 비밀번호를 잊어버렸어요.</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                개인정보 보호를 위해 PIN 비밀번호는 원문이 아닌 단방향 해시로만 저장됩니다. 비밀번호를 잊으신 경우 <Link href="/contact" className="text-indigo-600 underline font-bold">문의하기</Link>를 통해 운영진에게 안내를 받을 수 있습니다.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">Q. 모임방 주소(URL)를 잃어버렸어요.</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                모여잇은 회원가입이 없으므로 브라우저 방문 기록(히스토리)에서 `moyeoit-web.vercel.app/room/...`을 검색하시거나 카카오톡 단톡방 대화 내역에서 초대 링크를 다시 클릭하시면 즉시 접속할 수 있습니다.
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
