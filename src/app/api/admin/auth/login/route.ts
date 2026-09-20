import { NextRequest, NextResponse } from 'next/server';
import { requireJsonRequest, errorResponse, adminJsonResponse, ADMIN_NO_CACHE_HEADERS } from '@/lib/http/api';
import { createAdminAuthClient } from '@/lib/supabase/adminAuthServer';
import { isEmailInAdminWhitelist, getAdminMfaRoutingStep } from '@/lib/security/adminAuth';

export async function POST(request: NextRequest): Promise<NextResponse> {
  const jsonError = requireJsonRequest(request);
  if (jsonError) return jsonError;

  try {
    const body = await request.json();
    const email = typeof body?.email === 'string' ? body.email.trim() : '';
    const password = typeof body?.password === 'string' ? body.password : '';

    if (!email || !password) {
      return adminJsonResponse(
        { success: false, error: '이메일과 비밀번호를 모두 입력해 주세요.' },
        { status: 400 }
      );
    }

    const authClient = await createAdminAuthClient();
    const { data, error } = await authClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user || !data.user.email) {
      return adminJsonResponse(
        { success: false, error: '이메일 또는 비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      );
    }

    if (!isEmailInAdminWhitelist(data.user.email)) {
      await authClient.auth.signOut();
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
