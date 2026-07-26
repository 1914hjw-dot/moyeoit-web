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
            <span>개인정보 보호법 준수</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-100">개인정보 처리방침</h1>
          <p className="text-xs text-zinc-400 font-semibold">
            공고일자: 2026년 7월 26일 &nbsp;|&nbsp; 시행일자: 2026년 7월 26일
          </p>
        </div>

        <div className="space-y-8 text-xs sm:text-sm text-zinc-300 leading-relaxed">
          <p className="text-zinc-300 leading-normal">
            모여잇(Moyeoit, 이하 “서비스”)은 이용자의 개인정보를 중요하게 생각하며, 「개인정보 보호법」 등 관련 법령을 준수합니다.<br />
            본 개인정보 처리방침은 모여잇이 제공하는 일정 조율 및 투표 서비스에서 이용자의 개인정보를 어떻게 처리하는지 안내합니다.
          </p>

          <hr className="border-zinc-800" />

          {/* 제1조 */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-zinc-100">제1조(개인정보처리자 및 개인정보 보호 관련 문의)</h2>
            <p className="text-zinc-400">
              ① 모여잇의 개인정보처리자는 서비스 운영자 Jayden입니다.
            </p>
            <p className="text-zinc-400">
              ② 개인정보 보호와 관련된 문의, 개인정보 열람·정정·삭제 요청 및 기타 개인정보 관련 문의는 다음 연락처를 통해 할 수 있습니다.
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-zinc-300 bg-zinc-900/60 p-4 rounded-xl border border-zinc-800/80">
              <li><strong>서비스명:</strong> 모여잇(Moyeoit)</li>
              <li><strong>개인정보처리자:</strong> 모여잇 운영자 Jayden</li>
              <li>
                <strong>개인정보 보호 관련 문의:</strong>{' '}
                <a href="mailto:j6411863@gmail.com" className="text-indigo-400 underline font-semibold">
                  j6411863@gmail.com
                </a>
              </li>
            </ul>
          </section>

          {/* 제2조 */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-zinc-100">제2조(개인정보의 처리 목적)</h2>
            <p className="text-zinc-400">
              모여잇은 다음의 목적을 위해 개인정보를 처리합니다.
            </p>
            <ol className="list-decimal list-inside space-y-1 pl-2 text-zinc-300">
              <li>모임 일정 조율 및 투표 서비스 제공</li>
              <li>참여자별 투표 결과의 표시 및 관리</li>
              <li>이용자가 입력한 닉네임 및 메모의 저장 및 표시</li>
              <li>모임방 및 일정 조율 정보의 저장 및 제공</li>
              <li>투표 수정 및 삭제 요청에 대한 본인 확인</li>
              <li>서비스의 안정적인 운영 및 보안 유지</li>
              <li>서비스 이용 과정에서 발생하는 오류 및 장애 대응</li>
              <li>개인정보 관련 문의 및 권리행사 요청 처리</li>
            </ol>
            <p className="text-zinc-400">
              모여잇은 개인정보를 위 목적의 범위에서 처리합니다.
            </p>
          </section>

          {/* 제3조 */}
          <section className="space-y-4">
            <h2 className="text-base font-bold text-zinc-100">제3조(처리하는 개인정보의 항목 및 수집방법)</h2>
            
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-zinc-200">① 이용자가 직접 입력하거나 서비스 이용 과정에서 생성되는 정보</h3>
              <p className="text-zinc-400">
                모여잇은 회원가입 없이 이용할 수 있으며, 이용자가 서비스 이용 과정에서 입력하거나 서비스 이용 과정에서 생성되는 다음 정보를 처리할 수 있습니다.
              </p>
              
              <div className="space-y-2 pl-2 border-l-2 border-zinc-800">
                <div>
                  <p className="font-bold text-zinc-200">1. 닉네임</p>
                  <p className="text-zinc-400 text-xs">• 처리 목적: 참여자 식별 및 투표 결과 표시</p>
                </div>
                <div>
                  <p className="font-bold text-zinc-200">2. 투표 정보</p>
                  <p className="text-zinc-400 text-xs">• 처리 목적: 일정 가능 여부 확인 및 투표 결과 제공</p>
                </div>
                <div>
                  <p className="font-bold text-zinc-200">3. 메모</p>
                  <p className="text-zinc-400 text-xs">• 처리 목적: 이용자가 입력한 메모의 저장 및 표시</p>
                </div>
                <div>
                  <p className="font-bold text-zinc-200">4. 모임방 정보</p>
                  <p className="text-zinc-400 text-xs">• 처리 항목: 이용자가 입력한 모임방 제목, 설명 및 일정 관련 정보</p>
                  <p className="text-zinc-400 text-xs">• 처리 목적: 모임방 생성 및 일정 조율 서비스 제공</p>
                </div>
                <div>
                  <p className="font-bold text-zinc-200">5. 수정 인증 정보</p>
                  <p className="text-zinc-400 text-xs">• 처리 항목: 수정용 PIN을 이용하여 생성된 단방향 해시값</p>
                  <p className="text-zinc-400 text-xs">• 처리 목적: 투표 수정 및 삭제 과정에서의 본인 확인</p>
                </div>
              </div>
              <p className="text-zinc-400 italic">수정용 PIN 원문은 저장하지 않습니다.</p>
            </div>

            <div className="space-y-2 pt-1">
              <h3 className="text-xs font-bold text-zinc-200">② 서비스 운영 과정에서 다음과 같은 기술적 정보가 처리될 수 있습니다.</h3>
              <ul className="list-disc list-inside space-y-1 pl-2 text-zinc-300">
                <li>IP 주소</li>
                <li>User-Agent 정보</li>
                <li>접속 시각</li>
                <li>HTTP 요청 관련 정보</li>
                <li>서비스 이용 과정에서 발생하는 오류 및 기술적 로그 정보</li>
              </ul>
              <p className="text-zinc-400">
                이러한 정보는 서비스 운영, 보안 및 오류 대응을 위해 서비스 운영 인프라 또는 관련 시스템에서 처리될 수 있습니다.
              </p>
            </div>

            <div className="space-y-2 pt-1">
              <h3 className="text-xs font-bold text-zinc-200">③ 개인정보의 수집방법은 다음과 같습니다.</h3>
              <ol className="list-decimal list-inside space-y-1 pl-2 text-zinc-300">
                <li>이용자가 서비스 화면에 직접 입력하는 방법</li>
                <li>이용자가 투표를 제출하거나 수정·삭제하는 과정에서 생성되는 방법</li>
                <li>서비스 이용 과정에서 자동으로 생성되는 기술적 정보</li>
                <li>서비스 운영 인프라를 통해 생성·처리되는 로그 및 요청 정보</li>
              </ol>
            </div>

            <div className="space-y-2 pt-1">
              <h3 className="text-xs font-bold text-zinc-200">④ 민감정보 및 고유식별정보</h3>
              <p className="text-zinc-400">
                모여잇은 서비스 이용을 위해 주민등록번호, 여권번호, 운전면허번호 등 고유식별정보를 수집하지 않습니다.<br />
                또한 건강정보, 정치적 의견 등 민감정보를 서비스 이용을 위해 수집하지 않습니다.
              </p>
              <p className="text-zinc-400">
                이용자는 닉네임이나 메모에 주민등록번호, 연락처, 주소, 금융정보 등 서비스 이용에 필요하지 않은 개인정보를 입력하지 않도록 주의해야 합니다.
              </p>
            </div>
          </section>

          {/* 제4조 */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-zinc-100">제4조(개인정보의 처리 및 보유기간)</h2>
            <p className="text-zinc-400">
              ① 모여잇은 개인정보를 서비스 제공 및 운영에 필요한 기간 동안 처리합니다.
            </p>
            <p className="text-zinc-400">
              ② 모임방 정보 및 이에 포함된 닉네임, 투표 정보, 메모 등은 <strong className="text-amber-300">모임방 생성일로부터 90일 동안 보관</strong>합니다.
            </p>
            <p className="text-zinc-400">
              ③ 모임방 생성일로부터 90일이 경과한 모임방 및 해당 모임방에 저장된 정보는 정기적인 자동 삭제 작업을 통해 삭제합니다.
            </p>
            <p className="text-zinc-400">
              ④ 자동 삭제 작업의 실행 시점에 따라 보유기간 만료 시점과 실제 삭제 시점 사이에 일정한 시간 차이가 발생할 수 있습니다.
            </p>
            <p className="text-zinc-400">
              ⑤ 이용자는 서비스에서 제공되는 기능을 이용하여 자신의 투표 정보를 직접 삭제할 수 있습니다.
            </p>
            <p className="text-zinc-400">
              ⑥ 이용자는 개인정보 보호 관련 문의처를 통해 자신의 개인정보 삭제를 요청할 수 있습니다. 모여잇은 요청 내용을 확인한 후 관련 법령에 따라 처리합니다.
            </p>
            <p className="text-zinc-400">
              ⑦ 관계 법령에 따라 개인정보를 보존해야 하는 경우에는 해당 법령에서 정한 기간 동안 개인정보를 보관할 수 있습니다.
            </p>
          </section>

          {/* 제5조 */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-zinc-100">제5조(개인정보의 파기절차 및 방법)</h2>
            <p className="text-zinc-400">
              ① 모여잇은 개인정보의 보유기간이 경과하거나 처리 목적이 달성되어 개인정보가 더 이상 필요하지 않게 된 경우 해당 개인정보를 삭제합니다.
            </p>
            <p className="text-zinc-400">
              ② 전자적 파일 형태로 저장된 개인정보는 관련 시스템에서 삭제합니다.
            </p>
            <p className="text-zinc-400">
              ③ 이용자가 개인정보의 삭제를 요청하는 경우 요청자의 본인 여부 및 요청 내용을 확인한 후 관련 법령에 따라 처리합니다.
            </p>
          </section>

          {/* 제6조 */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-zinc-100">제6조(개인정보의 제3자 제공)</h2>
            <p className="text-zinc-400">
              ① 모여잇은 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다.
            </p>
            <p className="text-zinc-400">
              ② 다만, 다음의 경우에는 예외로 합니다.
            </p>
            <ol className="list-decimal list-inside space-y-1 pl-2 text-zinc-300">
              <li>이용자가 사전에 동의한 경우</li>
              <li>법률에 특별한 규정이 있는 경우</li>
              <li>수사기관 등 관계 기관이 법령에 따라 적법한 절차로 요청하는 경우</li>
            </ol>
          </section>

          {/* 제7조 */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-zinc-100">제7조(개인정보 처리의 위탁)</h2>
            <p className="text-zinc-400">
              ① 모여잇은 서비스 제공 및 운영을 위해 다음과 같은 외부 서비스를 이용할 수 있습니다.
            </p>
            <div className="space-y-2 bg-zinc-900/60 p-4 rounded-xl border border-zinc-800/80">
              <p className="font-bold text-zinc-200">1. 수탁자: Supabase</p>
              <p className="text-zinc-400 text-xs">• 위탁 업무: 클라우드 데이터베이스 및 데이터 저장·관리</p>
              
              <p className="font-bold text-zinc-200 pt-2">2. 수탁자: Vercel</p>
              <p className="text-zinc-400 text-xs">• 위탁 업무: 웹 서비스 호스팅 및 서비스 운영 인프라 제공</p>
            </div>
            <p className="text-zinc-400">
              ② 서비스 제공을 위해 이용자가 입력한 닉네임, 투표 정보, 메모 및 모임방 정보 등이 관련 서비스 인프라에서 처리될 수 있습니다.
            </p>
            <p className="text-zinc-400">
              ③ 서비스 운영 과정에서 IP 주소, User-Agent, 접속 시각 및 HTTP 요청 관련 정보 등 기술적 정보가 관련 서비스 인프라에서 처리될 수 있습니다.
            </p>
            <p className="text-zinc-400">
              ④ 수탁자 또는 위탁 업무의 내용이 변경되는 경우 관련 법령에 따라 필요한 내용을 본 개인정보 처리방침을 통해 안내합니다.
            </p>
          </section>

          {/* 제8조 */}
          <section className="space-y-4">
            <h2 className="text-base font-bold text-zinc-100">제8조(개인정보의 국외 이전)</h2>
            <p className="text-zinc-400">
              ① 모여잇은 서비스 제공을 위해 국외 사업자가 제공하는 클라우드 및 웹 서비스 인프라를 이용합니다.
            </p>
            <p className="text-zinc-400">
              ② 이에 따라 이용자가 서비스에 입력한 정보 또는 서비스 이용 과정에서 생성되는 정보가 국외에서 저장 또는 처리될 수 있습니다.
            </p>
            
            <div className="space-y-2 bg-zinc-900/60 p-4 rounded-xl border border-zinc-800/80">
              <h3 className="text-xs font-bold text-zinc-200">1. Supabase</h3>
              <ul className="list-disc list-inside space-y-1 text-zinc-300">
                <li><strong>이전받는 자:</strong> Supabase</li>
                <li><strong>이전 목적:</strong> 클라우드 데이터베이스 저장 및 서비스 제공</li>
                <li><strong>이전되는 정보:</strong> 닉네임, 투표 정보, 메모, 모임방 정보 등 서비스 이용 과정에서 저장되는 정보</li>
                <li><strong>이전 국가:</strong> 일본</li>
                <li><strong>보유 및 이용기간:</strong> 제4조에서 정한 기간 또는 서비스 제공에 필요한 기간</li>
              </ul>
            </div>

            <div className="space-y-2 bg-zinc-900/60 p-4 rounded-xl border border-zinc-800/80">
              <h3 className="text-xs font-bold text-zinc-200">2. Vercel</h3>
              <ul className="list-disc list-inside space-y-1 text-zinc-300">
                <li><strong>이전받는 자:</strong> Vercel</li>
                <li><strong>이전 목적:</strong> 웹 서비스 호스팅 및 서비스 운영</li>
                <li><strong>이전되는 정보:</strong> 서비스 운영 과정에서 처리될 수 있는 요청 정보 및 기술적 정보</li>
                <li><strong>이전 국가 및 지역:</strong> Vercel의 서비스 인프라 및 처리 환경에 따라 달라질 수 있음</li>
                <li><strong>보유 및 이용기간:</strong> 서비스 운영에 필요한 기간 및 관련 로그 정책에 따른 기간</li>
              </ul>
            </div>

            <p className="text-zinc-400">
              ③ 국외 이전과 관련된 사업자, 이전 국가, 이전 항목 또는 이전 목적에 변경이 발생하는 경우 관련 법령에 따라 필요한 내용을 안내합니다.
            </p>
          </section>

          {/* 제9조 */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-zinc-100">제9조(정보주체의 권리·의무 및 행사방법)</h2>
            <p className="text-zinc-400">
              ① 이용자는 관련 법령에 따라 자신의 개인정보에 대한 열람, 정정, 삭제 및 기타 법령에서 정하는 권리를 행사할 수 있습니다.
            </p>
            <p className="text-zinc-400">
              ② 개인정보 관련 권리행사는 다음 이메일을 통해 요청할 수 있습니다.
            </p>
            <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800/80 text-zinc-200">
              <strong>이메일:</strong>{' '}
              <a href="mailto:j6411863@gmail.com" className="text-indigo-400 underline font-semibold">
                j6411863@gmail.com
              </a>
            </div>
            <p className="text-zinc-400">
              ③ 모여잇은 이용자의 요청을 확인한 후 관련 법령에 따라 처리합니다.
            </p>
            <p className="text-zinc-400">
              ④ 개인정보 열람 또는 삭제 요청 시 요청자가 해당 정보의 이용자 본인인지 확인하기 위한 최소한의 확인 절차를 진행할 수 있습니다.
            </p>
            <p className="text-zinc-400">
              ⑤ 이용자는 자신의 개인정보를 정확하게 입력해야 하며, 타인의 개인정보를 무단으로 입력하거나 타인의 개인정보를 침해해서는 안 됩니다.
            </p>
          </section>

          {/* 제10조 */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-zinc-100">제10조(개인정보의 안전성 확보조치)</h2>
            <p className="text-zinc-400">
              모여잇은 개인정보의 안전성 확보를 위해 서비스 운영에 필요한 범위에서 다음과 같은 조치를 적용합니다.
            </p>
            <ol className="list-decimal list-inside space-y-1 pl-2 text-zinc-300">
              <li>HTTPS를 통한 전송 구간 암호화</li>
              <li>데이터베이스 접근 권한 관리</li>
              <li>개인정보 및 서비스 데이터에 대한 접근 권한 제한</li>
              <li>수정용 PIN 원문을 저장하지 않고 단방향 해시값을 이용한 본인 확인</li>
              <li>PIN 검증 시도에 대한 제한 등 서비스 보안 기능</li>
              <li>서비스 운영에 필요한 인증정보 및 비밀정보에 대한 접근 제한</li>
              <li>클라우드 인프라의 보안 기능 활용</li>
            </ol>
          </section>

          {/* 제11조 */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-zinc-100">제11조(브라우저 저장 기술의 이용)</h2>
            <p className="text-zinc-400">
              ① 모여잇은 서비스 이용 편의 및 기능 제공을 위해 브라우저의 localStorage 등 브라우저 저장 기술을 사용할 수 있습니다.
            </p>
            <p className="text-zinc-400">
              ② 서비스 이용 과정에서 투표 상태, 닉네임 등 서비스 이용에 필요한 일부 정보가 이용자의 브라우저에 저장될 수 있습니다.
            </p>
            <p className="text-zinc-400">
              ③ 이용자는 브라우저의 저장 데이터 삭제 기능 등을 이용하여 브라우저에 저장된 정보를 삭제할 수 있습니다.
            </p>
            <p className="text-zinc-400">
              ④ 브라우저 저장 기술의 사용을 제한하거나 삭제할 경우 일부 서비스 기능이 정상적으로 작동하지 않을 수 있습니다.
            </p>
          </section>

          {/* 제12조 */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-zinc-100">제12조(광고 서비스)</h2>
            <p className="text-zinc-400">
              ① 현재 모여잇은 Google AdSense를 사용하지 않습니다.
            </p>
            <p className="text-zinc-400">
              ② 향후 광고 서비스를 도입하는 경우 광고 제공, 광고 측정 또는 관련 서비스 제공을 위해 쿠키, 광고 식별자 또는 유사한 기술이 사용될 수 있습니다.
            </p>
            <p className="text-zinc-400">
              ③ 광고 서비스의 도입으로 개인정보 처리 방식에 중요한 변경이 발생하는 경우 관련 법령에 따라 필요한 내용을 본 개인정보 처리방침에 반영하여 안내합니다.
            </p>
          </section>

          {/* 제13조 */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-zinc-100">제13조(개인정보 보호 관련 문의 및 피해구제)</h2>
            <p className="text-zinc-400">
              ① 이용자는 개인정보 보호와 관련된 문의, 불만 처리 및 개인정보 침해 관련 상담을 위해 다음 연락처로 문의할 수 있습니다.
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-zinc-300">
              <li>
                <strong>이메일:</strong>{' '}
                <a href="mailto:j6411863@gmail.com" className="text-indigo-400 underline font-semibold">
                  j6411863@gmail.com
                </a>
              </li>
            </ul>
            <p className="text-zinc-400">
              ② 개인정보 침해와 관련하여 추가적인 신고, 상담 또는 분쟁조정이 필요한 경우 관련 법령에 따른 개인정보 보호 관련 기관을 이용할 수 있습니다.
            </p>
          </section>

          {/* 제14조 */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-zinc-100">제14조(개인정보 처리방침의 변경)</h2>
            <p className="text-zinc-400">
              ① 본 개인정보 처리방침은 관련 법령, 서비스 내용 또는 개인정보 처리 방식의 변경에 따라 변경될 수 있습니다.
            </p>
            <p className="text-zinc-400">
              ② 개인정보 처리방침을 변경하는 경우 변경사항을 이용자가 쉽게 확인할 수 있도록 서비스 내 또는 홈페이지를 통해 공개합니다.
            </p>
            <p className="text-zinc-400">
              ③ 중요한 변경사항이 있는 경우 변경 내용 및 시행일을 안내합니다.
            </p>
          </section>

          <hr className="border-zinc-800" />

          {/* 부칙 */}
          <section className="space-y-2 bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/60">
            <h2 className="text-base font-bold text-zinc-100">부칙</h2>
            <p className="text-zinc-300 font-semibold">
              본 개인정보 처리방침은 <strong>2026년 7월 26일</strong>부터 시행합니다.
            </p>
          </section>
        </div>
      </article>

      <Footer />
    </main>
  );
}
