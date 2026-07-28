import React from 'react';
import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://moyeoit-web.vercel.app';

export const metadata: Metadata = {
  title: '모임 & 약속 조율 실전 가이드 센터 | 모여잇 가이드',
  description: '친구들과 약속 날짜 빠르게 정하는 노하우, 회식 일정 조율 팁, 여행 일수 공유, 동아리/스터디 정기 모임 가이드 모음입니다.',
  alternates: {
    canonical: `${SITE_URL}/guide`,
  },
  openGraph: {
    title: '모여잇 실전 약속 조율 가이드 센터',
    description: '모임 성격별 실패 없는 약속 날짜 결정 가이드와 노하우 모음.',
    url: `${SITE_URL}/guide`,
  },
};

export default function GuideLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
