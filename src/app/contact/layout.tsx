import React from 'react';
import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://moyeoit-web.vercel.app';

export const metadata: Metadata = {
  title: '고객지원 및 문의하기 | 모여잇 Contact',
  description: '모여잇 서비스 이용 관련 일반 문의, 개인정보 처리 문의, 버그 제보 및 기능 제안을 하실 수 있는 공식 연계 창구입니다.',
  alternates: {
    canonical: `${SITE_URL}/contact`,
  },
  openGraph: {
    title: '모여잇 공식 문의 및 고객 지원 센터',
    description: '서비스 문의, 개인정보 문의 및 버그 제보 안내.',
    url: `${SITE_URL}/contact`,
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
