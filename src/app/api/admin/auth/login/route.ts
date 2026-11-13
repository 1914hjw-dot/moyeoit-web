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
import { createAdminAuthClient } from '@/lib/supabase/adminAuthServer';
import { isEmailInAdminWhitelist, getAdminMfaRoutingStep } from '@/lib/security/adminAuth';
import { logAuditTrail } from '@/lib/services/roomService';

const ADMIN_LOGIN_WINDOW_MS = 10 * 60_000;
const ADMIN_LOGIN_MAX_ATTEMPTS = 5;

export async function POST(request: NextRequest): Promise<NextResponse> {
  const jsonError = requireJsonRequest(request, ADMIN_NO_CACHE_HEADERS);
  if (jsonError) return jsonError;

  const ipRateLimitError = await enforceRateLimit(
    request,
    'admin-login-ip',
    ADMIN_LOGIN_MAX_ATTEMPTS,
    ADMIN_LOGIN_WINDOW_MS,
    { failClosed: true, headers: ADMIN_NO_CACHE_HEADERS }
  );
  if (ipRateLimitError) return ipRateLimitError;

  const clientIp = getClientIp(request);
  const userAgent = request.headers.get('user-agent') || undefined;

  try {
    const body = await parseJsonBody<Record<string, unknown>>(request);
    const email = typeof body?.email === 'string' ? body.email.trim() : '';
    const password = typeof body?.password === 'string' ? body.password : '';

    if (!email || !password) {
      return adminJsonResponse(
        { success: false, error: '이메일과 비밀번호를 모두 입력해 주세요.' },
        { status: 400 }
      );
    }

    const emailRateLimitError = await enforceIdentifierRateLimit(
      'admin-login-email',
      email.toLowerCase(),
      ADMIN_LOGIN_MAX_ATTEMPTS,
      ADMIN_LOGIN_WINDOW_MS,
      { failClosed: true, headers: ADMIN_NO_CACHE_HEADERS }
    );
    if (emailRateLimitError) return emailRateLimitError;

    const authClient = await createAdminAuthClient();
    const { data, error } = await authClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user || !data.user.email) {
      await logAuditTrail(
        'ADMIN_LOGIN_FAILED',
        email.toLowerCase(),
        { reason: 'INVALID_CREDENTIALS' },
        { ipAddress: clientIp, userAgent }
      );
      return adminJsonResponse(
        { success: false, error: '이메일 또는 비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      );
    }

    if (!isEmailInAdminWhitelist(data.user.email)) {
      await authClient.auth.signOut();
      await logAuditTrail(
        'ADMIN_LOGIN_FAILED',
        data.user.email.toLowerCase(),
        { reason: 'NOT_WHITELISTED' },
        { ipAddress: clientIp, userAgent }
      );
      return adminJsonResponse(
        { success: false, error: '이메일 또는 비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      );
    }

    const mfaStatus = await getAdminMfaRoutingStep(authClient);

    return adminJsonResponse({
      success: true,
      email: data.user.email,
      nextStep: mfaStatus.step,
      currentLevel: mfaStatus.currentLevel,
      nextLevel: mfaStatus.nextLevel,
    });
  } catch (error) {
    return errorResponse(error, '로그인 처리 중 오류가 발생했습니다.', ADMIN_NO_CACHE_HEADERS);
  }
}
