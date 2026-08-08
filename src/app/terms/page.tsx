'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, FileText, Calendar } from 'lucide-react';
import { Footer } from '@/components/ui/Footer';

export default function TermsPage() {
  return (
    <div className="min-h-screen max-w-4xl mx-auto px-4 py-6 space-y-6 flex flex-col justify-between">
      <div className="space-y-6">
        {/* Top Navigation */}
        <header className="flex items-center justify-between pb-3 border-b border-slate-200/80">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>모여잇 홈으로 돌아가기</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-xs shadow-sm">
              <Calendar className="w-4 h-4" />
            </div>
            <span className="text-xs font-black text-slate-900">서비스 이용약관</span>
          </div>
        </header>

        {/* Main Content Card */}
        <main className="sys-card rounded-3xl p-6 sm:p-10 border border-slate-200/80 space-y-8 bg-white shadow-xl shadow-slate-200/50 text-slate-700">
          <div className="space-y-2 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2 text-indigo-600">
              <FileText className="w-7 h-7" />
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900">모여잇 서비스 이용약관</h1>
            </div>
            <p className="text-xs text-slate-500 font-bold">공고일자: 2026년 7월 25일 | 시행일자: 2026년 7월 25일</p>
          </div>

          <div className="space-y-8 text-xs sm:text-sm leading-relaxed text-slate-600">
            {/* 제1조 */}
            <section className="space-y-2">
              <h2 className="text-base font-black text-slate-900">제1조(목적)</h2>
              <p className="text-slate-700">
                이 약관은 모여잇(Moyeoit)(이하 “모여잇” 또는 “서비스”)이 제공하는 웹 기반 약속 일정 조율 서비스의 이용과 관련하여 모여잇과 이용자 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
              </p>
            </section>

            {/* 제2조 */}
            <section className="space-y-2">
              <h2 className="text-base font-black text-slate-900">제2조(용어의 정의)</h2>
              <p className="text-slate-700 mb-1">이 약관에서 사용하는 용어의 뜻은 다음과 같습니다.</p>
              <ol className="list-decimal list-inside space-y-1 text-slate-700 pl-2">
                <li><strong>“서비스”</strong>란 모여잇이 제공하는 웹 기반 약속 일정 조율 및 투표 서비스를 말합니다.</li>
                <li><strong>“이용자”</strong>란 이 약관에 따라 모여잇이 제공하는 서비스를 이용하는 모든 사람을 말합니다.</li>
                <li><strong>“모임방”</strong>이란 이용자가 약속 일정을 조율하기 위해 생성하는 온라인 공간을 말합니다.</li>
                <li><strong>“투표 정보”</strong>란 이용자가 모임방에서 입력한 날짜·시간별 참석 가능 여부 등의 정보를 말합니다.</li>
                <li><strong>“이용자 콘텐츠”</strong>란 이용자가 서비스 이용 과정에서 직접 입력하는 모임 제목, 닉네임, 한줄 메모 및 기타 정보를 말합니다.</li>
                <li><strong>“수정용 인증정보”</strong>란 이용자가 자신의 투표 내역을 수정하기 위해 설정하는 인증정보를 말합니다.</li>
              </ol>
            </section>

            {/* 제3조 */}
            <section className="space-y-2">
              <h2 className="text-base font-black text-slate-900">제3조(약관의 게시 및 효력)</h2>
              <p className="text-slate-700">① 모여잇은 이용자가 이 약관의 내용을 쉽게 알 수 있도록 서비스 화면에 게시하거나 연결된 링크를 통해 제공합니다.</p>
              <p className="text-slate-700">② 이용자는 서비스를 이용함으로써 이 약관에 동의하게 됩니다.</p>
              <p className="text-slate-700">③ 모여잇은 관련 법령에 위배되지 않는 범위에서 이 약관을 변경할 수 있습니다.</p>
              <p className="text-slate-700">④ 약관을 변경하는 경우 모여잇은 변경 내용과 시행일을 서비스 내에서 공지합니다. 이용자에게 중요한 변경사항이 있는 경우에는 변경 전후의 내용을 이용자가 확인할 수 있도록 안내합니다.</p>
              <p className="text-slate-700">⑤ 이용자는 변경된 약관에 동의하지 않을 경우 서비스 이용을 중단할 수 있습니다.</p>
              <p className="text-slate-700">⑥ 모여잇의 개인정보 처리에 관한 사항은 별도로 공개하는 개인정보처리방침에 따릅니다.</p>
            </section>

            {/* 제4조 */}
            <section className="space-y-2">
              <h2 className="text-base font-black text-slate-900">제4조(서비스의 제공)</h2>
              <p className="text-slate-700">① 모여잇은 별도의 회원가입이나 로그인을 요구하지 않고 다음과 같은 서비스를 제공합니다.</p>
              <ol className="list-decimal list-inside space-y-1 text-slate-700 pl-4">
                <li>약속 일정 조율을 위한 모임방 생성</li>
                <li>날짜 및 시간별 참석 가능 여부 투표</li>
                <li>참석 가능 인원 및 일정 결과 계산</li>
                <li>일정 조율 결과의 확인</li>
                <li>투표 결과 및 일정 정보를 시각적으로 제공</li>
                <li>그 밖에 모여잇이 추가·개발하는 서비스</li>
              </ol>
              <p className="text-slate-700">② 모여잇은 서비스의 원활한 운영을 위하여 서비스의 일부 또는 전부를 변경할 수 있습니다.</p>
              <p className="text-slate-700">③ 모여잇은 서비스의 기능, 디자인, 운영 방식 및 제공 범위를 개선하거나 변경할 수 있습니다.</p>
            </section>

            {/* 제5조 */}
            <section className="space-y-2">
              <h2 className="text-base font-black text-slate-900">제5조(무회원 서비스 및 모임방 관리)</h2>
              <p className="text-slate-700">① 모여잇은 별도의 회원가입이나 로그인 없이 서비스를 제공할 수 있습니다.</p>
              <p className="text-slate-700">② 이용자는 모임방을 생성하거나 투표에 참여할 때 정확하고 적절한 정보를 입력하여야 합니다.</p>
              <p className="text-slate-700">③ 모임방 생성자는 해당 모임방의 URL, 접근정보 및 수정용 인증정보를 안전하게 관리하여야 합니다.</p>
              <p className="text-slate-700">④ 모임방 URL 또는 접근정보를 다른 사람에게 공유하는 경우, 해당 모임방의 정보가 공유받은 사람에게 표시될 수 있습니다.</p>
            </section>

            {/* 제6조 */}
            <section className="space-y-2">
              <h2 className="text-base font-black text-slate-900">제6조(이용자의 의무)</h2>
              <p className="text-slate-700">① 이용자는 관련 법령, 이 약관, 서비스 이용 안내 및 모여잇이 공지하는 사항을 준수하여야 합니다.</p>
              <p className="text-slate-700">② 이용자는 다음 각 호의 행위를 하여서는 안 됩니다.</p>
              <ol className="list-decimal list-inside space-y-1 text-slate-700 pl-4">
                <li>타인의 개인정보 또는 인증정보를 부정하게 이용하는 행위</li>
                <li>타인의 명예를 훼손하거나 모욕하는 내용을 게시하는 행위</li>
                <li>타인의 사생활을 침해하거나 개인정보를 무단으로 게시하는 행위</li>
                <li>불법정보 또는 법령에 위반되는 정보를 게시하는 행위</li>
                <li>타인의 저작권, 상표권 등 지식재산권을 침해하는 행위</li>
                <li>서비스를 이용하여 사기, 협박, 괴롭힘 또는 기타 불법행위를 하는 행위</li>
                <li>자동화 프로그램, 봇, 스크립트 등을 이용하여 정상적인 이용 범위를 벗어나 반복적인 요청을 보내는 행위</li>
                <li>서비스의 정상적인 운영을 방해하거나 서버 및 네트워크에 과도한 부하를 발생시키는 행위</li>
                <li>서비스의 취약점을 탐색하거나 이를 악용하는 행위</li>
                <li>서비스의 소스코드, 시스템 또는 보안기능을 무단으로 분석·복제·변조하는 행위</li>
                <li>다른 이용자의 서비스 이용을 방해하는 행위</li>
                <li>그 밖에 관련 법령 또는 공서양속에 위반되는 행위</li>
                <li>그 밖에 서비스의 정상적인 운영을 방해하는 행위</li>
              </ol>
              <p className="text-slate-700 pt-1">
                ③ 이용자는 닉네임, 모임 제목 또는 한줄 메모에 주민등록번호, 계정 비밀번호, 금융정보, 연락처 및 주소 등 불필요한 개인정보를 입력하지 않아야 합니다.
              </p>
            </section>

            {/* 제7조 */}
            <section className="space-y-2">
              <h2 className="text-base font-black text-slate-900">제7조(이용자 콘텐츠의 관리 및 책임)</h2>
              <p className="text-slate-700">① 이용자가 서비스에 입력한 모임 제목, 닉네임, 한줄 메모 및 기타 정보의 적법성, 정확성 및 적절성에 대한 책임은 해당 이용자에게 있습니다.</p>
              <p className="text-slate-700">② 이용자는 자신이 입력한 콘텐츠로 인해 타인의 권리 또는 법령을 침해하지 않도록 하여야 합니다.</p>
              <p className="text-slate-700">③ 이용자가 입력한 콘텐츠로 인하여 제3자에게 손해가 발생하거나 모여잇에 법적 책임 또는 비용이 발생하는 경우, 해당 이용자는 관련 법령에 따라 그 책임을 부담할 수 있습니다.</p>
              <p className="text-slate-700">④ 모여잇은 이용자가 입력한 콘텐츠를 원칙적으로 사전 검열하지 않습니다.</p>
              <p className="text-slate-700">⑤ 모여잇은 다음 각 호의 어느 하나에 해당하는 콘텐츠를 발견하거나 신고받은 경우 관련 법령 및 서비스 운영 기준에 따라 해당 콘텐츠를 삭제, 비공개 처리 또는 접근 제한할 수 있습니다.</p>
              <ol className="list-decimal list-inside space-y-1 text-slate-700 pl-4">
                <li>법령에 위반되는 콘텐츠</li>
                <li>타인의 권리를 침해하는 콘텐츠</li>
                <li>명예훼손, 모욕, 사생활 침해 등 권리 침해 우려가 있는 콘텐츠</li>
                <li>불법정보 또는 유해정보</li>
                <li>서비스의 정상적인 운영을 방해하는 콘텐츠</li>
                <li>광고, 스팸 또는 반복적으로 게시되는 홍보성 콘텐츠</li>
                <li>그 밖에 서비스 운영 목적에 부합하지 않는 콘텐츠</li>
              </ol>
            </section>

            {/* 제8조 */}
            <section className="space-y-2">
              <h2 className="text-base font-black text-slate-900">제8조(이용자 콘텐츠의 공개)</h2>
              <p className="text-slate-700">① 이용자가 모임방에 입력한 닉네임, 모임 제목, 한줄 메모 및 투표 결과는 해당 모임방에 접근할 수 있는 다른 이용자에게 표시될 수 있습니다.</p>
              <p className="text-slate-700">② 이용자는 모임방에 공개되는 정보를 직접 관리하여야 하며, 공개를 원하지 않는 개인정보를 입력하지 않아야 합니다.</p>
              <p className="text-slate-700">③ 모임방 URL 또는 접근정보를 다른 사람에게 공유한 경우, 해당 모임방에 저장된 정보가 공유받은 사람에게 표시될 수 있습니다.</p>
            </section>

            {/* 제9조 */}
            <section className="space-y-2">
              <h2 className="text-base font-black text-slate-900">제9조(서비스 이용 제한 및 모임방 삭제)</h2>
              <p className="text-slate-700">① 모여잇은 이용자가 다음 각 호의 어느 하나에 해당하는 경우 서비스 이용을 제한하거나 모임방의 전부 또는 일부를 삭제할 수 있습니다.</p>
              <ol className="list-decimal list-inside space-y-1 text-slate-700 pl-4">
                <li>이 약관을 위반한 경우</li>
                <li>관계 법령을 위반한 경우</li>
                <li>타인의 권리 또는 개인정보를 침해한 경우</li>
                <li>서비스의 정상적인 운영을 방해한 경우</li>
                <li>자동화된 방식으로 비정상적인 요청을 반복한 경우</li>
                <li>불법적인 콘텐츠를 게시한 경우</li>
                <li>보안상 위험이 발생하였거나 발생할 우려가 있는 경우</li>
                <li>그 밖에 서비스의 안정적인 운영을 위해 필요한 경우</li>
              </ol>
              <p className="text-slate-700">② 모여잇은 긴급한 보안 위협, 불법정보 또는 서비스 운영에 중대한 지장을 초래하는 행위가 확인된 경우 사전 통지 없이 해당 콘텐츠 또는 모임방을 제한하거나 삭제할 수 있습니다.</p>
              <p className="text-slate-700">③ 모여잇은 가능한 경우 이용자에게 제한 또는 삭제 사유를 안내할 수 있습니다. 다만 보안상 이유, 법령상 제한 또는 제3자의 권리 보호를 위해 필요한 경우에는 상세한 사유를 안내하지 않을 수 있습니다.</p>
            </section>

            {/* 제10조 */}
            <section className="space-y-2">
              <h2 className="text-base font-black text-slate-900">제10조(서비스의 일시 중단)</h2>
              <p className="text-slate-700">① 모여잇은 다음 각 호의 사유가 발생한 경우 서비스의 전부 또는 일부를 일시적으로 중단할 수 있습니다.</p>
              <ol className="list-decimal list-inside space-y-1 text-slate-700 pl-4">
                <li>서비스 설비의 점검, 보수, 교체 또는 공사</li>
                <li>서버, 네트워크 또는 클라우드 인프라 장애</li>
                <li>통신사업자의 통신 서비스 중단</li>
                <li>천재지변, 전쟁, 국가비상사태 등 불가항력</li>
                <li>보안사고 또는 사이버 공격 대응</li>
                <li>그 밖에 서비스의 안정적인 운영을 위해 필요한 경우</li>
              </ol>
              <p className="text-slate-700">② 모여잇은 서비스 중단이 예정된 경우 가능한 범위에서 사전에 안내합니다. 다만 긴급한 장애나 보안사고 등 사전 안내가 어려운 경우에는 사후에 안내할 수 있습니다.</p>
            </section>

            {/* 제11조 */}
            <section className="space-y-2">
              <h2 className="text-base font-black text-slate-900">제11조(서비스 정보의 성격 및 이용자 판단)</h2>
              <p className="text-slate-700">① 모여잇은 이용자가 입력한 정보를 바탕으로 일정 조율 결과를 계산하여 제공합니다.</p>
              <p className="text-slate-700">② 모여잇이 제공하는 최적 일정, 참석 가능 인원, 히트맵 등은 이용자가 입력한 정보에 기반한 참고 결과입니다.</p>
              <p className="text-slate-700">③ 이용자는 최종적인 약속 날짜, 시간 및 장소를 직접 확인하고 결정하여야 합니다.</p>
              <p className="text-slate-700">④ 모여잇은 이용자의 입력 오류, 이용자 간 의사소통 오류, 잘못된 투표 또는 이용자의 최종 약속 결정으로 발생한 손해에 대하여 모여잇의 고의 또는 과실이 없는 경우 책임을 부담하지 않습니다.</p>
            </section>

            {/* 제12조 */}
            <section className="space-y-2">
              <h2 className="text-base font-black text-slate-900">제12조(지식재산권)</h2>
              <p className="text-slate-700">① 모여잇이 제공하는 서비스와 관련된 소프트웨어, 디자인, 로고, 상표, 화면 구성, 데이터베이스 및 기타 콘텐츠에 관한 지식재산권은 모여잇 또는 정당한 권리자에게 귀속됩니다.</p>
              <p className="text-slate-700">② 이용자는 모여잇의 사전 서면 동의 없이 서비스를 복제, 수정, 배포, 판매, 대여, 역설계하거나 상업적으로 이용할 수 없습니다.</p>
              <p className="text-slate-700">③ 이용자가 서비스에 입력한 이용자 콘텐츠에 대한 권리는 해당 이용자에게 귀속됩니다.</p>
              <p className="text-slate-700">④ 이용자는 모여잇이 서비스를 제공하고 운영하는 데 필요한 범위에서 이용자 콘텐츠를 저장, 전송, 표시 및 처리할 수 있음에 동의합니다.</p>
              <p className="text-slate-700">⑤ 모여잇은 이용자 콘텐츠를 서비스 제공 목적을 벗어나 부당하게 이용하지 않습니다.</p>
            </section>

            {/* 제13조 */}
            <section className="space-y-2">
              <h2 className="text-base font-black text-slate-900">제13조(광고의 게재)</h2>
              <p className="text-slate-700">① 모여잇은 서비스 운영을 위해 광고를 게재할 수 있습니다.</p>
              <p className="text-slate-700">② 광고는 Google AdSense, Kakao AdFit 등 외부 광고 제공 서비스에 의해 제공될 수 있습니다.</p>
              <p className="text-slate-700">③ 광고주가 제공하는 상품 또는 서비스의 거래에 관한 책임은 해당 광고주에게 있습니다.</p>
              <p className="text-slate-700">④ 광고와 관련한 개인정보 및 쿠키의 처리에 대해서는 모여잇의 개인정보처리방침 및 각 광고 제공자의 정책이 적용됩니다.</p>
            </section>

            {/* 제14조 */}
            <section className="space-y-2">
              <h2 className="text-base font-black text-slate-900">제14조(개인정보 보호)</h2>
              <p className="text-slate-700">① 모여잇은 이용자의 개인정보를 보호하기 위해 관련 법령을 준수합니다.</p>
              <p className="text-slate-700">② 개인정보의 처리에 관한 사항은 모여잇이 별도로 공개하는 개인정보처리방침에 따릅니다.</p>
            </section>

            {/* 제15조 */}
            <section className="space-y-2">
              <h2 className="text-base font-black text-slate-900">제15조(책임의 제한)</h2>
              <p className="text-slate-700">① 모여잇은 천재지변, 전쟁, 국가비상사태, 통신망 장애, 클라우드 인프라 장애, 해킹·사이버공격 등 모여잇이 합리적으로 통제할 수 없는 사유로 서비스를 제공할 수 없는 경우 책임을 부담하지 않습니다. 다만 모여잇의 고의 또는 과실이 있는 경우에는 그러하지 않습니다.</p>
              <p className="text-slate-700">② 모여잇은 이용자의 귀책사유로 발생한 서비스 이용 장애에 대하여 책임을 부담하지 않습니다.</p>
              <p className="text-slate-700">③ 모여잇은 이용자가 서비스를 이용하여 기대하는 일정 조율 결과, 약속 성립, 참석 여부 또는 특정한 결과를 보장하지 않습니다.</p>
              <p className="text-slate-700">④ 모여잇은 이용자 상호 간 또는 이용자와 제3자 사이에 발생한 분쟁에 직접적인 책임을 부담하지 않습니다. 다만 분쟁의 원인이 모여잇의 고의 또는 과실에 기인한 경우에는 관련 법령에 따라 책임을 부담할 수 있습니다.</p>
              <p className="text-slate-700">⑤ 이 조항은 모여잇의 고의 또는 중대한 과실로 발생한 손해에 대한 책임을 면제하거나 제한하는 것으로 해석되지 않습니다.</p>
            </section>

            {/* 제16조 */}
            <section className="space-y-2">
              <h2 className="text-base font-black text-slate-900">제16조(손해배상)</h2>
              <p className="text-slate-700">① 이용자가 이 약관 또는 관련 법령을 위반하여 모여잇에 손해를 발생시킨 경우, 해당 이용자는 관련 법령에 따라 그 손해를 배상할 책임을 부담할 수 있습니다.</p>
              <p className="text-slate-700">② 이용자의 불법행위 또는 약관 위반으로 인해 제3자가 모여잇을 상대로 법적 청구를 하는 경우, 이용자는 관련 법령에 따라 그 책임을 부담할 수 있습니다.</p>
              <p className="text-slate-700">③ 모여잇의 손해배상책임은 관련 법령이 정하는 범위 내에서 인정됩니다.</p>
            </section>

            {/* 제17조 */}
            <section className="space-y-2">
              <h2 className="text-base font-black text-slate-900">제17조(약관의 변경)</h2>
              <p className="text-slate-700">① 모여잇은 관련 법령을 위반하지 않는 범위에서 이 약관을 변경할 수 있습니다.</p>
              <p className="text-slate-700">② 변경된 약관은 시행일과 함께 서비스 내에 공지합니다.</p>
              <p className="text-slate-700">③ 이용자에게 중대한 불이익을 초래할 수 있는 약관 변경의 경우에는 변경 전 충분한 기간 동안 그 내용을 공지하고, 이용자가 변경 내용을 알 수 있도록 안내합니다.</p>
              <p className="text-slate-700">④ 이용자가 변경된 약관의 시행일 이후에도 서비스를 계속 이용하는 경우 변경된 약관에 동의한 것으로 볼 수 있습니다.</p>
              <p className="text-slate-700">⑤ 이용자는 변경된 약관에 동의하지 않을 경우 서비스 이용을 중단할 수 있습니다.</p>
            </section>

            {/* 제18조 */}
            <section className="space-y-2">
              <h2 className="text-base font-black text-slate-900">제18조(통지 및 연락)</h2>
              <p className="text-slate-700">① 모여잇은 서비스 화면에 공지하거나 기타 합리적인 방법으로 이용자에게 통지할 수 있습니다.</p>
              <p className="text-slate-700">② 모여잇은 무회원 서비스의 특성상 개별 이용자의 연락처를 보유하지 않을 수 있으므로, 서비스 내 공지를 통해 전체 이용자에게 통지할 수 있습니다.</p>
              <p className="text-slate-700">
                ③ 서비스 이용 및 개인정보 보호와 관련한 문의는 다음 이메일로 할 수 있습니다. <br />
                <strong>문의 이메일: <a href="mailto:j64118637@gmail.com" className="text-indigo-600 underline font-bold">j64118637@gmail.com</a></strong>
              </p>
            </section>

            {/* 제19조 */}
            <section className="space-y-2">
              <h2 className="text-base font-black text-slate-900">제19조(준거법 및 관할법원)</h2>
              <p className="text-slate-700">① 모여잇과 이용자 간에 발생한 분쟁에 대해서는 대한민국 법을 준거법으로 합니다.</p>
              <p className="text-slate-700">② 서비스 이용과 관련하여 분쟁이 발생한 경우 당사자는 상호 협의를 통해 원만하게 해결하도록 노력합니다.</p>
              <p className="text-slate-700">③ 협의로 해결되지 않는 분쟁에 대해서는 관련 법령에 따른 관할 법원에 제소합니다.</p>
            </section>

            {/* 부칙 */}
            <section className="space-y-2 border-t border-slate-100 pt-4">
              <h2 className="text-base font-black text-slate-900">부칙</h2>
              <p className="text-slate-800 font-bold">제1조(시행일)</p>
              <p className="text-slate-700">이 약관은 2026년 7월 25일부터 시행합니다.</p>
            </section>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
