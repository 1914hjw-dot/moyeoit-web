import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/security/adminAuth';
import { errorResponse } from '@/lib/http/api';

export async function GET(): Promise<NextResponse> {
  try {
    const { email } = await verifyAdminSession();
    return NextResponse.json({
      success: true,
      authenticated: true,
      email,
    });
  } catch (error) {
    return errorResponse(error, '관리자 인증 세션을 확인할 수 없습니다.');
  }
}
