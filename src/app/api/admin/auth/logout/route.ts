import { NextRequest, NextResponse } from 'next/server';
import { createAdminAuthClient } from '@/lib/supabase/adminAuthServer';
import { errorResponse, adminJsonResponse, ADMIN_NO_CACHE_HEADERS } from '@/lib/http/api';

export async function POST(request: NextRequest): Promise<NextResponse> {
  const origin = request.headers.get('origin');
  if (origin) {
    const expectedHost =
      request.headers.get('x-forwarded-host')?.split(',')[0]?.trim() ||
      request.headers.get('host')?.trim();
    try {
      if (!expectedHost || new URL(origin).host !== expectedHost) {
        return adminJsonResponse(
          { success: false, error: '허용되지 않은 요청 출처입니다.' },
          { status: 403 }
        );
      }
    } catch {
      return adminJsonResponse(
        { success: false, error: '허용되지 않은 요청 출처입니다.' },
        { status: 403 }
      );
    }
  }

  try {
    const authClient = await createAdminAuthClient();
    await authClient.auth.signOut();

    return adminJsonResponse({ success: true, message: '로그아웃되었습니다.' });
  } catch (error) {
    return errorResponse(error, '로그아웃 처리 중 오류가 발생했습니다.', ADMIN_NO_CACHE_HEADERS);
  }
}
