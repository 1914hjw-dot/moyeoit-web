import { NextRequest, NextResponse } from 'next/server';
import { requireJsonRequest, errorResponse, adminJsonResponse, ADMIN_NO_CACHE_HEADERS } from '@/lib/http/api';
import { verifyAdminAal1Session } from '@/lib/security/adminAuth';

export async function POST(request: NextRequest): Promise<NextResponse> {
  const jsonError = requireJsonRequest(request);
  if (jsonError) return jsonError;

  try {
    const { authClient } = await verifyAdminAal1Session();

    const body = await request.json();
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
