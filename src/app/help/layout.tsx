import React from 'react';
import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://moyeoit-web.vercel.app';

export const metadata: Metadata = {
  title: '이용 안내 및 자주 묻는 문제 해결 | 모여잇 도움말 센터',
  description: '모여잇 약속 방 생성법, 카카오톡 초대 링크 공유, 가능 날짜 투표, 1위 결과 확인, 투표 수정 및 PIN 비밀번호 분실 문제 해결 가이드입니다.',
  alternates: {
    canonical: `${SITE_URL}/help`,
  },
  openGraph: {
    title: '모여잇 이용 도움말 센터 | 상세 가이드 및 문제 해결',
    description: '모여잇의 모든 기능 사용법과 문제 해결법을 한눈에 확인하세요.',
    url: `${SITE_URL}/help`,
  },
};

export default function HelpLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
