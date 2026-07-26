import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#09090b',
};

export const metadata: Metadata = {
  title: '모여잇 (Moyeoit) - 5초 약속 날짜 조율기',
  description: '로그인 0초, 카톡 투표보다 10배 빠르고 예쁜 무회원 약속 날짜 조율기. 전원 참석 가능한 최적의 황금 날짜 TOP 3와 컬러 히트맵을 10초 만에 확인하세요.',
  keywords: [
    '모여잇',
    'Moyeoit',
    '날짜 조율',
    '약속 조율',
    '모임 날짜 정하기',
    'When2meet 한국어',
    '카카오톡 날짜 투표',
    '무회원 일정 조율',
  ],
  authors: [{ name: '모여잇 팀' }],
  openGraph: {
    title: '모여잇 (Moyeoit) - 5초 약속 날짜 조율기',
    description: '로그인 0초, 단톡방 친구들과 10초 만에 가능 날짜를 투표하세요. 전원 참석 가능한 최적의 날짜를 자동으로 알려줍니다.',
    url: 'https://moyeoit.com',
    siteName: '모여잇 (Moyeoit)',
    images: [
      {
        url: 'https://moyeoit.com/api/og?title=%EC%96%B8%EC%A0%9C%20%EB%A7%8C%EB%82%A0%EA%B9%8C%3F%20%EB%AA%A8%EC%97%AC%EC%9E%87%EC%97%90%EC%84%9C%20%EB%B0%94%EB%A1%9C%20%EC%A0%95%ED%95%B4%EC%9A%94',
        width: 1200,
        height: 630,
        alt: '모여잇 5초 약속 날짜 조율기',
      },
    ],
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '모여잇 (Moyeoit) - 5초 약속 날짜 조율기',
    description: '로그인 0초, 단톡방 친구들과 10초 만에 가능 날짜를 투표하세요.',
    images: ['https://moyeoit.com/api/og?title=%EB%AA%A8%EC%97%AC%EC%9E%87'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="dark overflow-x-hidden">
      <head>
        {/* Schema.org Structured Data for Rich Snippets */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: '모여잇 (Moyeoit)',
              applicationCategory: 'UtilityApplication',
              operatingSystem: 'All',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'KRW',
              },
              description: '로그인 0초 무회원 5초 약속 날짜 조율기',
            }),
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
      <body className="antialiased selection:bg-indigo-500/30 selection:text-indigo-200 min-h-screen overflow-x-hidden pb-[env(safe-area-inset-bottom)]">
        {children}
      </body>
    </html>
  );
}
