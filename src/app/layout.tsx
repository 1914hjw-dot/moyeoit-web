import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
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
  title: '모여잇 | 친구들과 모임 약속 날짜 정하기 5초 조율기',
  description: '회원가입 없이 친구들과 모임 약속 날짜를 빠르게 정해보세요. 카카오톡 단톡방에 링크 하나로 조율하고 전원 참석 가능한 최적의 날짜를 10초 만에 찾아드립니다.',
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
    title: '모여잇 | 친구들과 모임 약속 날짜 정하기 5초 조율기',
    description: '회원가입 없이 친구들과 모임 약속 날짜를 빠르게 정해보세요. 카카오톡 단톡방에 링크 하나로 가능 날짜를 투표하고 최적의 약속 날짜를 자동 계산합니다.',
    url: SITE_URL,
    siteName: '모여잇 (Moyeoit)',
    images: [
      {
        url: `${SITE_URL}/api/og?title=${encodeURIComponent('친구들과 약속 날짜, 모여잇으로 10초 만에 정해요!')}`,
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
    title: '모여잇 | 친구들과 모임 약속 날짜 정하기 5초 조율기',
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
    description: '로그인 0초, 비회원 모임 약속 날짜 5초 조율 서비스',
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
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=G-MOYEOIT2026`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-MOYEOIT2026');
          `}
        </Script>
      </head>
      <body className="antialiased selection:bg-indigo-500/20 selection:text-indigo-900 min-h-screen overflow-x-hidden pb-[env(safe-area-inset-bottom)]">
        {children}
      </body>
    </html>
  );
}
