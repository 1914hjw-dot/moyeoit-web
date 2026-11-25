import 'server-only';

import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { AppError } from '@/lib/errors';
import {
  checkRateLimit,
  createRateLimitKey,
  type RateLimitResult,
} from '@/lib/security/rateLimiter';
import {
  checkSameOrigin,
  DEFAULT_MAX_JSON_BYTES,
  extractClientIpFromHeaders,
  parseJsonBodyWithLimit,
} from './requestSecurity';

export interface EnforceRateLimitOptions {
  failClosed?: boolean;
  headers?: HeadersInit;
}

export function verifySameOrigin(
  request: NextRequest,
  headers?: HeadersInit
): NextResponse | null {
  const result = checkSameOrigin(request.headers);
  if (result.ok) return null;

  return NextResponse.json(
    { success: false, error: result.error },
    { status: 403, ...(headers ? { headers } : {}) }
  );
}

export function requireJsonRequest(
  request: NextRequest,
  headers?: HeadersInit
): NextResponse | null {
  const init = headers ? { headers } : undefined;
  const contentType = request.headers.get('content-type') || '';
  if (!contentType.toLowerCase().includes('application/json')) {
    return NextResponse.json(
      { success: false, error: '올바른 Content-Type (application/json)이 아닙니다.' },
      { status: 415, ...init }
    );
  }

  const contentLength = Number(request.headers.get('content-length') || 0);
  if (Number.isFinite(contentLength) && contentLength > DEFAULT_MAX_JSON_BYTES) {
    return NextResponse.json(
      { success: false, error: '요청 본문이 너무 큽니다.' },
      { status: 413, ...init }
    );
  }

  return verifySameOrigin(request, headers);
}

export async function parseJsonBody<T = Record<string, unknown>>(
  request: NextRequest,
  maxBytes: number = DEFAULT_MAX_JSON_BYTES
): Promise<T> {
  return parseJsonBodyWithLimit<T>(request, maxBytes);
}

export function getClientIp(request: NextRequest): string {
  return extractClientIpFromHeaders(request.headers);
}

function buildRateLimitErrorResponse(
  result: RateLimitResult,
  maxAttempts: number,
  headers?: HeadersInit
): NextResponse | null {
  if (result.backendUnavailable) {
    return NextResponse.json(
      {
        success: false,
        error: '보안 확인 서비스를 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도해 주세요.',
      },
      { status: 503, ...(headers ? { headers } : {}) }
    );
  }

  if (result.allowed) return null;

  const mergedHeaders = new Headers(headers);
  mergedHeaders.set('Retry-After', result.resetTimeSeconds.toString());
  mergedHeaders.set('X-RateLimit-Limit', maxAttempts.toString());
  mergedHeaders.set('X-RateLimit-Remaining', '0');

  return NextResponse.json(
    {
      success: false,
      error: '짧은 시간 동안 너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해 주세요.',
    },
    { status: 429, headers: mergedHeaders }
  );
}

export async function enforceRateLimit(
  request: NextRequest,
  scope: string,
  maxAttempts: number,
  windowMs: number = 60_000,
  options?: EnforceRateLimitOptions
): Promise<NextResponse | null> {
  const result = await checkRateLimit(
    createRateLimitKey(scope, getClientIp(request)),
    maxAttempts,
    windowMs,
    { failClosed: options?.failClosed }
  );

  return buildRateLimitErrorResponse(result, maxAttempts, options?.headers);
}

export async function enforceIdentifierRateLimit(
  scope: string,
  identifier: string,
  maxAttempts: number,
  windowMs: number = 60_000,
  options?: EnforceRateLimitOptions
): Promise<NextResponse | null> {
  const result = await checkRateLimit(
    createRateLimitKey(scope, identifier),
    maxAttempts,
    windowMs,
    { failClosed: options?.failClosed }
  );

  return buildRateLimitErrorResponse(result, maxAttempts, options?.headers);
}

export const ADMIN_NO_CACHE_HEADERS = {
  'Cache-Control': 'private, no-store, no-cache, must-revalidate, max-age=0',
  Pragma: 'no-cache',
  Expires: '0',
} as const;

export function adminJsonResponse(body: unknown, init?: ResponseInit): NextResponse {
  return NextResponse.json(body, {
    ...init,
    headers: {
      ...ADMIN_NO_CACHE_HEADERS,
      ...(init?.headers || {}),
    },
  });
}

export function errorResponse(
  error: unknown,
  fallbackMessage: string,
  headers?: HeadersInit
): NextResponse {
  const init = headers ? { headers } : undefined;

  if (error instanceof ZodError) {
    return NextResponse.json(
      { success: false, error: error.issues[0]?.message || '입력값을 확인해 주세요.' },
      { status: 400, ...init }
    );
  }

  if (error instanceof AppError) {
    const mergedHeaders = new Headers(headers);
    const retryAfterSeconds =
      typeof error.retryAfterSeconds === 'number' &&
      Number.isFinite(error.retryAfterSeconds) &&
      error.retryAfterSeconds > 0
        ? Math.ceil(error.retryAfterSeconds)
        : undefined;

    if (retryAfterSeconds !== undefined) {
      mergedHeaders.set('Retry-After', retryAfterSeconds.toString());
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        code: error.code,
        ...(retryAfterSeconds !== undefined ? { retry_after_seconds: retryAfterSeconds } : {}),
        ...(error.details ? { details: error.details } : {}),
      },
      { status: error.status, headers: mergedHeaders }
    );
  }

  return NextResponse.json({ success: false, error: fallbackMessage }, { status: 500, ...init });
}
