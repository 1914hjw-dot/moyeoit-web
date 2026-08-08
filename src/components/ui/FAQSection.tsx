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
    question: '날짜 범위를 정하지 않고 자유 날짜 모드로 만들 수 있나요?',
    answer: '네! [자유 날짜 선택] 방식을 선택하면 방장이 후보 날짜나 요일을 미리 정하지 않고도 바로 약속 방을 만들 수 있습니다. 초대 링크를 받은 참여자들이 각자 캘린더에서 가능한 날짜를 자유롭게 골라 투표합니다.',
  },
  {
    question: '모두가 가능한 날짜가 있으면 어떻게 표시되나요?',
    answer: '모든 참여자가 참석 가능한 날짜(100% 가능)가 존재할 경우 [🎉 전원 참석 가능한 황금 날짜]로 최우선 계산되어 표출됩니다. 100% 가능한 날짜가 여러 개라면 모두 명시하여 방장이 1개 선택할 수 있습니다.',
  },
  {
    question: '모두 가능한 날짜가 없으면 어떻게 되나요?',
    answer: '전원 참석 일자가 없을 경우 [🥇 가장 많은 사람이 가능한 날짜]를 자동 산정하여 1위로 추천합니다. 1위 최다 참석 인원이 동률인 경우에도 모든 1위 날짜를 묶어 투명하게 보여줍니다.',
  },
  {
    question: '누가 최종 약속 날짜를 결정하고 확정하나요?',
    answer: '방장(모임 생성자) 브라우저에서 추천 날짜 카드의 [이 날짜로 모임 확정하기] 버튼을 눌러 일정을 확정할 수 있습니다. 확정 완료 시 파티 폭죽 카드와 카카오톡/링크 4단계 공유가 활성화됩니다.',
  },
  {
    question: '투표한 내용을 수정하거나 삭제하고 싶으면 어떻게 하나요?',
    answer: '투표 작성 시 설정한 4자리 수정용 PIN 비밀번호를 입력하면 언제든지 본인의 투표 가능 여부를 수정하거나 삭제할 수 있습니다.',
  },
  {
    question: '시간대별(오전, 오후, 저녁) 조율도 가능한가요?',
    answer: '네! [기간 내에서 선택] 모드에서 조율 방식을 [날짜 + 시간대]로 선택하시면 날짜뿐만 아니라 오전(10:00~14:00), 오후(14:00~18:00), 저녁(18:00~22:00) 시간대별 참석 여부도 정교하게 조율할 수 있습니다.',
  },
  {
    question: '생성된 모임방과 투표 데이터는 얼마나 보관되나요?',
    answer: '개인정보 보호와 불필요한 데이터 축적을 방지하기 위해 생성된 모임방과 투표 정보는 모임방 생성일로부터 90일 후 자동으로 완전히 파기됩니다.',
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
