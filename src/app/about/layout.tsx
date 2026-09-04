import React from 'react';
import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://moyeoit-web.vercel.app';

export const metadata: Metadata = {
  title: '모여잇 서비스 소개 & 개인정보 최소 수집 철학 | 모여잇',
  description: '모여잇(Moyeoit)이 왜 태어났는지, 서비스 개발 철학과 개인정보 보호 원칙, 비회원 약속 조율 서비스의 핵심 가치를 소개해 드립니다.',
  alternates: {
    canonical: `${SITE_URL}/about`,
  },
  openGraph: {
    title: '모여잇 서비스 소개 | 비회원 약속 날짜 조율',
    description: '회원가입 없이 단톡방 친구들과 가능한 날짜를 모으고 약속을 확정하는 모여잇의 이야기.',
    url: `${SITE_URL}/about`,
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
