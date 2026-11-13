import { NextRequest, NextResponse } from 'next/server';
import { createAdminAuthClient } from '@/lib/supabase/adminAuthServer';
import {
  ADMIN_NO_CACHE_HEADERS,
  adminJsonResponse,
  errorResponse,
  verifySameOrigin,
} from '@/lib/http/api';

export async function POST(request: NextRequest): Promise<NextResponse> {
  const originError = verifySameOrigin(request, ADMIN_NO_CACHE_HEADERS);
  if (originError) return originError;

  try {
    const authClient = await createAdminAuthClient();
    await authClient.auth.signOut();

    return adminJsonResponse({ success: true, message: '로그아웃되었습니다.' });
  } catch (error) {
    return errorResponse(error, '로그아웃 처리 중 오류가 발생했습니다.', ADMIN_NO_CACHE_HEADERS);
  }
}
