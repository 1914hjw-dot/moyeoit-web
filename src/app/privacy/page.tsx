'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Calendar } from 'lucide-react';
import { Footer } from '@/components/ui/Footer';

export default function PrivacyPage() {
  return (
    <main className="min-h-screen max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Top Header Navigation */}
      <header className="flex items-center justify-between pb-4 border-b border-zinc-800">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-400 hover:text-zinc-100 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>모여잇 홈으로</span>
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-zinc-100 text-zinc-950 flex items-center justify-center font-bold text-xs">
            <Calendar className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-extrabold text-zinc-200">모여잇 (Moyeoit)</span>
        </div>
      </header>

      {/* Main Content Card */}
      <article className="sys-card p-6 sm:p-10 space-y-8">
        <div className="space-y-2 pb-6 border-b border-zinc-800">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>개인정보 보호법 제30조 준수</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-100">개인정보처리방침</h1>
          <p className="text-xs text-zinc-400">
            공고일자: 2026년 7월 25일 | 시행일자: 2026년 7월 25일
          </p>
        </div>

        <div className="prose prose-invert max-w-none text-xs sm:text-sm text-zinc-300 leading-relaxed space-y-6">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-zinc-100">제1조(개인정보처리자 및 개인정보 보호책임자)</h2>
            <p className="text-zinc-400">
              ① 모여잇(Moyeoit)은 이용자의 개인정보를 중요하게 생각하며 관련 법령을 준수합니다.<br />
              - 개인정보처리자: 모여잇 운영팀 (운영자: Jayden)<br />
              - 개인정보 보호 관련 문의: <a href="mailto:privacy@moyeoit.com" className="text-indigo-400 underline">privacy@moyeoit.com</a>
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-zinc-100">제2조(처리하는 개인정보 항목 및 수집방법)</h2>
            <p className="text-zinc-400">
              모여잇은 회원가입 없이 이용할 수 있는 무회원 서비스이며, 일정 조율에 필요한 최소한의 정보만 처리합니다.<br />
              - 필수 항목: 모임방 제목, 후보 날짜, 참여자 닉네임, 날짜/시간대별 투표 정보<br />
              - 선택 항목: 수정용 비밀번호(SHA-256 단방향 암호화 보관), 한줄 메모
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-zinc-100">제3조(개인정보의 처리 및 보유기간)</h2>
            <p className="text-zinc-400">
              모모잇은 수집 목적이 달성된 개인정보를 지체 없이 파기합니다.<br />
              - 모임방 정보 및 투표 내역: 모임방 생성일로부터 90일 보관 후 자동 파기
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-zinc-100">제4조(개인정보의 파기절차 및 파기방법)</h2>
            <p className="text-zinc-400">
              보유기간이 경과한 개인정보는 복구 불가능한 전자적 방법으로 영구 삭제됩니다.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-zinc-100">제5조(개인정보의 제3자 제공)</h2>
            <p className="text-zinc-400">
              모여잇은 이용자의 개인정보를 외부에 제공하지 않습니다. (법령에 따른 의무 제외)
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-zinc-100">제6조(개인정보 처리 위탁 및 국외 이전)</h2>
            <p className="text-zinc-400">
              원활한 서비스 운영을 위하여 다음과 같이 인프라 서비스에 위탁하고 있습니다.<br />
              - Vercel Inc. (웹 호스팅 및 에지 컴퓨팅 - 미국)<br />
              - Supabase Inc. (클라우드 데이터베이스 - 미국)
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-zinc-100">제7조(정보주체 및 법정대리인의 권리·의무)</h2>
            <p className="text-zinc-400">
              이용자는 언제든지 본인의 투표 내역 열람, 수정, 삭제를 요청할 수 있습니다.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-zinc-100">제8조(개인정보의 안전성 확보조치)</h2>
            <p className="text-zinc-400">
              - 비밀번호 단방향 암호화 (SHA-256)<br />
              - HTTPS 전송 구간 암호화
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-zinc-100">제9조(쿠키 및 유사 기술의 사용)</h2>
            <p className="text-zinc-400">
              서비스 운영 및 분석을 위하여 쿠키를 사용할 수 있으며, 브라우저 설정을 통해 거부할 수 있습니다.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-zinc-100">제10조(맞춤형 광고 및 분석 도구)</h2>
            <p className="text-zinc-400">
              Google AdSense, Kakao AdFit 및 GA4 분석 도구가 활용될 수 있습니다.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-zinc-100">제11조~제16조(권익침해 구제 및 방침 변경)</h2>
            <p className="text-zinc-400">
              개인정보 보호와 관련된 모든 문의는 <a href="mailto:privacy@moyeoit.com" className="text-indigo-400 underline">privacy@moyeoit.com</a>으로 보내주시기 바랍니다.
            </p>
          </section>
        </div>
      </article>

      <Footer />
    </main>
  );
}
