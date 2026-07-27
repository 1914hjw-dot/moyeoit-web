import React from 'react';
import type { Metadata } from 'next';
import { supabase } from '@/lib/supabase';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://moyeoit-web.vercel.app';

interface RoomLayoutProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: RoomLayoutProps): Promise<Metadata> {
  const { id } = await params;

  let roomTitle = '모임 약속 날짜 정하기';
  let roomDescription = '약속 날짜를 선택해주세요. 전원 참석 가능한 최적의 날짜를 한눈에 확인해보세요.';

  try {
    if (supabase) {
      const { data: room } = await supabase
        .from('rooms')
        .select('title, description')
        .eq('id', id)
        .single();

      if (room && room.title && room.title.trim().length > 0 && isNaN(Number(room.title.trim()))) {
        roomTitle = room.title.trim();
      }
      if (room && room.description && room.description.trim().length > 0) {
        roomDescription = room.description.trim();
      }
    }
  } catch (e) {
    // Fallback gracefully if query fails
  }

  const roomUrl = `${SITE_URL}/room/${id}`;
  const ogImageUrl = `${SITE_URL}/api/og?title=${encodeURIComponent(roomTitle)}`;

  return {
    title: `${roomTitle} | 모여잇`,
    description: roomDescription,
    // Technical SEO: Prevent indexing of personal vote schedules in Google Search
    robots: {
      index: false,
      follow: true,
      googleBot: {
        index: false,
        follow: true,
      },
    },
    alternates: {
      canonical: roomUrl,
    },
    // Open Graph for KakaoTalk & SNS Rich Link Previews
    openGraph: {
      title: `[모여잇] ${roomTitle}`,
      description: roomDescription,
      url: roomUrl,
      siteName: '모여잇 (Moyeoit)',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${roomTitle} 약속 날짜 투표`,
        },
      ],
      locale: 'ko_KR',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `[모여잇] ${roomTitle}`,
      description: roomDescription,
      images: [ogImageUrl],
    },
  };
}

export default function RoomLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
