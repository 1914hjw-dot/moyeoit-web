import 'server-only';

import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { AppError } from '@/lib/errors';
import { checkRateLimit, createRateLimitKey } from '@/lib/security/rateLimiter';

export function requireJsonRequest(request: NextRequest): NextResponse | null {
  const contentType = request.headers.get('content-type') || '';
  if (!contentType.toLowerCase().includes('application/json')) {
    return NextResponse.json(
      { success: false, error: '올바른 Content-Type (application/json)이 아닙니다.' },
      { status: 415 }
    );
  }

  const contentLength = Number(request.headers.get('content-length') || 0);
  if (Number.isFinite(contentLength) && contentLength > 64 * 1024) {
    return NextResponse.json(
      { success: false, error: '요청 본문이 너무 큽니다.' },
      { status: 413 }
    );
  }

  const origin = request.headers.get('origin');
  if (origin) {
    const expectedHost =
      request.headers.get('x-forwarded-host')?.split(',')[0]?.trim() ||
      request.headers.get('host')?.trim();
    try {
      if (!expectedHost || new URL(origin).host !== expectedHost) {
        return NextResponse.json(
          { success: false, error: '허용되지 않은 요청 출처입니다.' },
          { status: 403 }
        );
      }
    } catch {
      return NextResponse.json(
        { success: false, error: '허용되지 않은 요청 출처입니다.' },
        { status: 403 }
      );
    }
  }

  return null;
}

export function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip')?.trim() ||
    'unknown'
  );
}

export async function enforceRateLimit(
  request: NextRequest,
  scope: string,
  maxAttempts: number,
  windowMs: number = 60_000
): Promise<NextResponse | null> {
  const result = await checkRateLimit(
    createRateLimitKey(scope, getClientIp(request)),
    maxAttempts,
    windowMs
  );
  if (result.allowed) return null;

  return NextResponse.json(
    { success: false, error: '짧은 시간 동안 너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해 주세요.' },
    {
      status: 429,
      headers: {
        'Retry-After': result.resetTimeSeconds.toString(),
        'X-RateLimit-Limit': maxAttempts.toString(),
        'X-RateLimit-Remaining': '0',
      },
    }
  );
}

export function errorResponse(error: unknown, fallbackMessage: string): NextResponse {
  if (error instanceof ZodError) {
    return NextResponse.json(
      { success: false, error: error.issues[0]?.message || '입력값을 확인해 주세요.' },
      { status: 400 }
    );
  }

  if (error instanceof AppError) {
    return NextResponse.json(
      { success: false, error: error.message, code: error.code },
      { status: error.status }
    );
  }

  return NextResponse.json({ success: false, error: fallbackMessage }, { status: 500 });
}
