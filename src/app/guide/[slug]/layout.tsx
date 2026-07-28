import React from 'react';
import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://moyeoit-web.vercel.app';

export function generateStaticParams() {
  return [
    { slug: 'fast-date-picker' },
    { slug: 'company-dinner' },
    { slug: 'travel-planning' },
    { slug: 'study-group' },
    { slug: 'kakao-share-guide' },
  ];
}

interface GuideLayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: GuideLayoutProps): Promise<Metadata> {
  const { slug } = await params;

  return {
    title: `모임 & 약속 조율 실전 가이드 | 모여잇`,
    description: `친구들과 약속 날짜 빠르게 정하는 방법, 회식 일정 조율 및 카카오톡 링크 공유 노하우 가이드입니다.`,
    alternates: {
      canonical: `${SITE_URL}/guide/${slug}`,
    },
  };
}

export default function GuideSlugLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
