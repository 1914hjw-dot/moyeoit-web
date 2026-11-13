import { AppError } from '../errors.ts';

export const DEFAULT_MAX_JSON_BYTES = 64 * 1024;

function isTrustedProxyEnvironment(): boolean {
  return process.env.VERCEL === '1' || process.env.TRUST_PROXY === 'true';
}

export function getExpectedHostFromHeaders(headers: Headers): string | null {
  if (isTrustedProxyEnvironment()) {
    const forwardedHost = headers.get('x-forwarded-host')?.split(',')[0]?.trim();
    if (forwardedHost) return forwardedHost;
  }

  const directHost = headers.get('host')?.trim();
  if (directHost) return directHost;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl) {
    try {
      return new URL(siteUrl).host;
    } catch {
      return null;
    }
  }

  return null;
}

export function checkSameOrigin(headers: Headers): { ok: true } | { ok: false; error: string } {
  const origin = headers.get('origin');
  if (!origin) return { ok: true };

  const expectedHost = getExpectedHostFromHeaders(headers);
  try {
    if (!expectedHost || new URL(origin).host !== expectedHost) {
      return { ok: false, error: '허용되지 않은 요청 출처입니다.' };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: '허용되지 않은 요청 출처입니다.' };
  }
}

function normalizeIpCandidate(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const cleaned = raw.split(',')[0]?.trim().replace(/[\r\n\t\0]/g, '');
  if (!cleaned || cleaned.length > 64) return null;
  return cleaned;
}

export function extractClientIpFromHeaders(headers: Headers): string {
  if (process.env.VERCEL === '1') {
    return (
      normalizeIpCandidate(headers.get('x-vercel-forwarded-for')) ||
      normalizeIpCandidate(headers.get('x-real-ip')) ||
      normalizeIpCandidate(headers.get('x-forwarded-for')) ||
      'unknown'
    );
  }

  return (
    normalizeIpCandidate(headers.get('x-real-ip')) ||
    normalizeIpCandidate(headers.get('x-forwarded-for')) ||
    'unknown'
  );
}

export async function parseJsonBodyWithLimit<T = Record<string, unknown>>(
  request: Request,
  maxBytes: number = DEFAULT_MAX_JSON_BYTES
): Promise<T> {
  const headerLength = Number(request.headers.get('content-length') || 0);
  if (Number.isFinite(headerLength) && headerLength > maxBytes) {
    throw new AppError('요청 본문이 너무 큽니다.', 413, 'PAYLOAD_TOO_LARGE');
  }

  const rawText = await request.text();
  if (Buffer.byteLength(rawText, 'utf8') > maxBytes) {
    throw new AppError('요청 본문이 너무 큽니다.', 413, 'PAYLOAD_TOO_LARGE');
  }

  if (!rawText.trim()) {
    throw new AppError('요청 본문이 비어 있습니다.', 400, 'INVALID_JSON');
  }

  try {
    return JSON.parse(rawText) as T;
  } catch {
    throw new AppError('올바른 JSON 형식이 아닙니다.', 400, 'INVALID_JSON');
  }
}
