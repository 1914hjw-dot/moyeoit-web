import type { NextConfig } from "next";

const scriptSources = [
  "'self'",
  "'unsafe-inline'",
  ...(process.env.NODE_ENV === 'development' ? ["'unsafe-eval'"] : []),
  'https://t1.kakaocdn.net',
  'https://*.kakaocdn.net',
  'https://t1.daumcdn.net',
  'https://*.daumcdn.net',
  'https://display.adfit.kakao.com',
  'https://*.adfit.kakao.com',
  'https://serv.ds.kakao.com',
  'https://*.ds.kakao.com',
  'https://www.googletagmanager.com',
].join(' ');

const nextConfig: NextConfig = {
  poweredByHeader: false, // Hide X-Powered-By: Next.js
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              `script-src ${scriptSources}`,
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "font-src 'self' data:",
              "frame-src 'self' https://display.adfit.kakao.com https://*.adfit.kakao.com https://t1.kakaocdn.net https://*.kakaocdn.net https://t1.daumcdn.net https://*.daumcdn.net https://serv.ds.kakao.com https://*.ds.kakao.com",
              "connect-src 'self' https://*.supabase.co https://www.google-analytics.com https://*.google-analytics.com https://display.adfit.kakao.com https://*.adfit.kakao.com https://serv.ds.kakao.com https://*.ds.kakao.com https://aem-kakao-collector.onkakao.net https://*.onkakao.net https://*.kakaocdn.net https://*.daumcdn.net https://*.daum.net",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'self'",
              'upgrade-insecure-requests',
            ].join('; '),
          },
          {
            key: 'X-Permitted-Cross-Domain-Policies',
            value: 'none',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
