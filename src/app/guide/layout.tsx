import React from 'react';
import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://moyeoit-web.vercel.app';

export const metadata: Metadata = {
  title: '모임 & 약속 조율 실전 가이드 센터 | 모여잇 가이드',
  description: '친구 약속, 팀 회식, 단체 여행, 동아리와 스터디의 후보 선정부터 날짜 확정까지 실제 상황별 일정 조율 방법을 설명합니다.',
  authors: [{ name: '모여잇 팀', url: `${SITE_URL}/about` }],
  creator: '모여잇 팀',
  publisher: '모여잇 (Moyeoit)',
  alternates: {
    canonical: `${SITE_URL}/guide`,
  },
  openGraph: {
    title: '모여잇 실전 약속 조율 가이드 센터',
    description: '모임 성격별 후보 선정, 응답 수집, 결과 판단과 날짜 확정 방법을 정리한 실전 가이드입니다.',
    url: `${SITE_URL}/guide`,
    siteName: '모여잇 (Moyeoit)',
    locale: 'ko_KR',
    type: 'website',
  },
};

export default function GuideLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
