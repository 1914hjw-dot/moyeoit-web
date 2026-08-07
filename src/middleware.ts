import { NextRequest, NextResponse } from 'next/server';

// In-Memory Rate Limiter Map for API Protection
const RATE_LIMIT_STORE: Map<string, { count: number; resetTime: number }> = new Map();

// Housekeeping interval to prevent memory leaks in long-running instances
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of RATE_LIMIT_STORE.entries()) {
    if (now > record.resetTime) {
      RATE_LIMIT_STORE.delete(ip);
    }
  }
}, 60000);

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const response = NextResponse.next();

  // 1. HTTP Security Headers Attachment
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), browsing-topics=()'
  );

  // Content-Security-Policy Hardened for Kakao AdFit, Supabase, and GA4
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://t1.kakaocdn.net https://*.kakaocdn.net https://t1.daumcdn.net https://*.daumcdn.net https://display.adfit.kakao.com https://*.adfit.kakao.com https://www.googletagmanager.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: https://t1.kakaocdn.net https://*.kakaocdn.net https://*.daumcdn.net https://display.adfit.kakao.com; font-src 'self' data:; frame-src 'self' https://display.adfit.kakao.com https://*.adfit.kakao.com https://*.daumcdn.net; connect-src 'self' https://*.supabase.co https://www.google-analytics.com https://display.adfit.kakao.com https://*.adfit.kakao.com https://*.kakaocdn.net https://*.daumcdn.net https://*.daum.net;"
  );

  // 2. API Endpoint Rate Limiting (Protection against Denial of Service & Spamming)
  if (pathname.startsWith('/api/rooms')) {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute window
    const maxRequests = pathname.endsWith('/votes') ? 15 : 10; // Max 15 vote submissions or 10 room creations per min

    const record = RATE_LIMIT_STORE.get(ip) || { count: 0, resetTime: now + windowMs };

    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + windowMs;
    } else {
      record.count += 1;
    }

    RATE_LIMIT_STORE.set(ip, record);

    if (record.count > maxRequests) {
      return NextResponse.json(
        {
          success: false,
          error: '짧은 시간 동안 너무 많은 요청이 발생했습니다. 1분 후 다시 시도해 주세요.',
        },
        {
          status: 429,
          headers: {
            'Retry-After': '60',
            'X-RateLimit-Limit': maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
          },
        }
      );
    }

    response.headers.set('X-RateLimit-Limit', maxRequests.toString());
    response.headers.set(
      'X-RateLimit-Remaining',
      Math.max(0, maxRequests - record.count).toString()
    );
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
