import { NextRequest, NextResponse } from 'next/server';
import {
  ADMIN_NO_CACHE_HEADERS,
  adminJsonResponse,
  enforceIdentifierRateLimit,
  enforceRateLimit,
  errorResponse,
  getClientIp,
  parseJsonBody,
  requireJsonRequest,
} from '@/lib/http/api';
import { verifyAdminAal1Session } from '@/lib/security/adminAuth';
import { logAuditTrail } from '@/lib/services/roomService';

const ADMIN_MFA_WINDOW_MS = 10 * 60_000;
const ADMIN_MFA_MAX_ATTEMPTS = 5;

export async function POST(request: NextRequest): Promise<NextResponse> {
  const jsonError = requireJsonRequest(request, ADMIN_NO_CACHE_HEADERS);
  if (jsonError) return jsonError;

  const ipRateLimitError = await enforceRateLimit(
    request,
    'admin-mfa-ip',
    ADMIN_MFA_MAX_ATTEMPTS,
    ADMIN_MFA_WINDOW_MS,
    { failClosed: true, headers: ADMIN_NO_CACHE_HEADERS }
  );
  if (ipRateLimitError) return ipRateLimitError;

  const clientIp = getClientIp(request);
  const userAgent = request.headers.get('user-agent') || undefined;

  try {
    const { email, authClient } = await verifyAdminAal1Session();

    const userRateLimitError = await enforceIdentifierRateLimit(
      'admin-mfa-user',
      email.toLowerCase(),
      ADMIN_MFA_MAX_ATTEMPTS,
      ADMIN_MFA_WINDOW_MS,
      { failClosed: true, headers: ADMIN_NO_CACHE_HEADERS }
    );
    if (userRateLimitError) return userRateLimitError;

    const body = await parseJsonBody<Record<string, unknown>>(request);
    const factorId = typeof body?.factorId === 'string' ? body.factorId.trim() : '';
    const code = typeof body?.code === 'string' ? body.code.trim() : '';

    if (!factorId) {
      return adminJsonResponse(
        { success: false, error: '인증 팩터 식별자가 누락되었습니다.' },
        { status: 400 }
      );
    }

    if (!/^\d{6}$/.test(code)) {
      return adminJsonResponse(
        { success: false, error: '6자리 숫자 인증 코드를 올바르게 입력해 주세요.' },
        { status: 400 }
      );
    }

    const { data, error } = await authClient.auth.mfa.challengeAndVerify({
      factorId,
      code,
    });

    if (error || !data) {
      await logAuditTrail(
        'ADMIN_MFA_VERIFY_FAILED',
        email.toLowerCase(),
        { factorId },
        { ipAddress: clientIp, userAgent }
      );
      return adminJsonResponse(
        { success: false, error: '인증 코드가 올바르지 않거나 만료되었습니다. 다시 시도해 주세요.' },
        { status: 400 }
      );
    }

    return adminJsonResponse({
      success: true,
      aal: 'aal2',
    });
  } catch (error) {
    return errorResponse(error, '2단계 인증 확인 중 오류가 발생했습니다.', ADMIN_NO_CACHE_HEADERS);
  }
}
