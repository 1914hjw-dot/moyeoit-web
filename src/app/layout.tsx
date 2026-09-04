import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import GoogleAnalytics from '@/components/analytics/GoogleAnalytics';
import './globals.css';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://moyeoit-web.vercel.app';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#fafafc',
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: '모여잇 | 친구들과 모임 약속 날짜 정하기',
  description: '회원가입 없이 친구들과 모임 약속 날짜를 정해보세요. 카카오톡 단톡방에 링크를 공유하고 가능한 날짜를 모아 참석하기 좋은 후보를 확인할 수 있습니다.',
  keywords: [
    '약속 날짜 정하기',
    '모임 날짜 정하기',
    '날짜 투표',
    '친구 약속 날짜 조율',
    '모임 일정 조율',
    '모여잇',
    'Moyeoit',
    'When2meet 한국어',
    '카카오톡 날짜 투표',
    '비회원 일정 조율',
  ],
  authors: [{ name: '모여잇 팀' }],
  alternates: {
    canonical: SITE_URL,
  },
  verification: {
    google: 'X36LQ_xozdgroPuhx_5qpdjavg-KFGbc2GccGHASLTc',
    other: {
      'naver-site-verification': 'b55388f53a50e79d7a086675b0bbefa67221b333',
    },
  },
  other: {
    'google-adsense-account': 'ca-pub-3199026813976563',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: '모여잇 | 친구들과 모임 약속 날짜 정하기',
    description: '회원가입 없이 친구들과 모임 약속 날짜를 빠르게 정해보세요. 카카오톡 단톡방에 링크 하나로 가능 날짜를 투표하고 최적의 약속 날짜를 자동 계산합니다.',
    url: SITE_URL,
    siteName: '모여잇 (Moyeoit)',
    images: [
      {
        url: `${SITE_URL}/api/og?title=${encodeURIComponent('친구들과 약속 날짜, 모여잇으로 함께 정해요')}`,
        width: 1200,
        height: 630,
        alt: '모여잇 모임 약속 날짜 조율기',
      },
    ],
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '모여잇 | 친구들과 모임 약속 날짜 정하기',
    description: '회원가입 없이 친구들과 모임 약속 날짜를 빠르게 정해보세요.',
    images: [`${SITE_URL}/api/og?title=${encodeURIComponent('모여잇 모임 약속 날짜 조율기')}`],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLdWebSite = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: '모여잇 (Moyeoit)',
    url: SITE_URL,
    description: '회원가입 없이 링크 하나로 친구들과 약속 날짜를 빠르게 조율하는 서비스',
    inLanguage: 'ko-KR',
  };

  const jsonLdWebApp = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: '모여잇 (Moyeoit)',
    url: SITE_URL,
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'All',
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'KRW',
    },
    description: '회원가입 없이 링크로 참여하는 모임 약속 날짜 조율 서비스',
  };

  return (
    <html lang="ko" className="light bg-[#FAFAFC] text-slate-900 overflow-x-hidden">
      <head>
        {/* Schema.org Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLdWebSite),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLdWebApp),
          }}
        />

        {/* Kakao JavaScript SDK */}
        <Script
          src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js"
          strategy="afterInteractive"
          crossOrigin="anonymous"
        />

        {/* Google Analytics 4 Script */}
        <GoogleAnalytics />
      </head>
      <body className="antialiased selection:bg-indigo-500/20 selection:text-indigo-900 min-h-screen overflow-x-hidden pb-[env(safe-area-inset-bottom)]">
        {children}
      </body>
    </html>
  );
}
