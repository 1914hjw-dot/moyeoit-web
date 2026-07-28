'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

export interface FAQItem {
  question: string;
  answer: string;
}

export const FAQ_DATA: FAQItem[] = [
  {
    question: '모여잇은 회원가입이나 로그인이 필요한가요?',
    answer: '아니요, 모여잇은 회원가입이나 별도의 로그인 과정이 100% 필요 없습니다. 모임방 생성부터 투표 참여까지 0초 만에 바로 시작할 수 있습니다.',
  },
  {
    question: '약속 후보 날짜는 어떻게 생성하고 공유하나요?',
    answer: '메인 화면에서 모임 제목을 입력하고 달력에서 원하는 후보 날짜들을 클릭한 후 [약속 방 만들기] 버튼을 누르면 단 1초 만에 고유한 초대 링크가 생성됩니다. 생성된 링크를 카카오톡 단톡방이나 문자 메시지로 친구들에게 전달하면 됩니다.',
  },
  {
    question: '친구들이 투표한 결과는 어떻게 확인하나요?',
    answer: '초대 링크로 접속하면 전원 참여가 가능한 최적의 날짜(1위, 2위, 3위)가 자동으로 계산되어 표출됩니다. 또한 히트맵을 통해 일자별 참석 인원수와 누구 가능한지 명단을 실시간으로 확인할 수 있습니다.',
  },
  {
    question: '투표한 내용을 수정하거나 삭제하고 싶으면 어떻게 하나요?',
    answer: '투표 작성 시 설정한 4자리 수정용 PIN 비밀번호를 입력하면 언제든지 본인의 투표 가능 여부를 수정하거나 삭제할 수 있습니다.',
  },
  {
    question: '시간대별(오전, 오후, 저녁) 조율도 가능한가요?',
    answer: '네! 방을 만들 때 조율 방식을 [날짜 + 시간대]로 선택하시면 날짜뿐만 아니라 오전(10:00~14:00), 오후(14:00~18:00), 저녁(18:00~22:00) 시간대별 참석 가능 여부도 정교하게 조율할 수 있습니다.',
  },
  {
    question: '생성된 모임방과 투표 데이터는 얼마나 보관되나요?',
    answer: '개인정보 보호와 불필요한 데이터 축적을 방지하기 위해 생성된 모임방과 투표 정보는 모임방 생성일로부터 90일 후 자동으로 완전히 파기됩니다.',
  },
  {
    question: '방장(모임 생성자)이 최종 날짜를 확정하는 기능이 있나요?',
    answer: '네, 방장으로 접속 시 가장 추천하는 날짜 카드에서 [👑 방장: 이 날짜로 모임 확정하기] 버튼을 눌러 최종 모임 일정을 깔끔하게 확정하고 전달할 수 있습니다.',
  },
  {
    question: '모바일 스마트폰이나 단톡방 브라우저에서도 잘 작동하나요?',
    answer: '네, 모여잇은 카카오톡 인앱 브라우저, 사파리, 크롬, 네이버 앱 등 모든 스마트폰 브라우저 환경에 완벽히 최적화된 반응형 웹 앱입니다.',
  },
];

export const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="sys-card p-6 sm:p-8 space-y-6 bg-white border-slate-200/80 shadow-md rounded-3xl">
      <div className="space-y-1.5 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2 text-indigo-600">
          <HelpCircle className="w-5 h-5" />
          <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
            자주 묻는 질문 (FAQ)
          </h2>
        </div>
        <p className="text-xs text-slate-500">
          모여잇 이용과 관련하여 자주 궁금해하시는 질문과 답변 모음입니다.
        </p>
      </div>

      <div className="space-y-3">
        {FAQ_DATA.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="rounded-2xl border border-slate-200/80 overflow-hidden transition-all bg-slate-50/50"
            >
              <button
                type="button"
                onClick={() => toggleAccordion(idx)}
                className="w-full p-4 text-left flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-100/80 transition-colors"
                aria-expanded={isOpen}
              >
                <span className="text-xs sm:text-sm font-extrabold text-slate-900 leading-snug flex items-start gap-2">
                  <span className="text-indigo-600 shrink-0">Q.</span>
                  <span>{item.question}</span>
                </span>
                <span className="text-slate-400 shrink-0">
                  {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </span>
              </button>

              {isOpen && (
                <div className="p-4 pt-0 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-white">
                  <p className="pt-3">{item.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
