import { NextResponse } from 'next/server';
import { verifyAdminAal1Session } from '@/lib/security/adminAuth';
import { errorResponse, adminJsonResponse, ADMIN_NO_CACHE_HEADERS } from '@/lib/http/api';

export async function POST(): Promise<NextResponse> {
  try {
    const { user, authClient } = await verifyAdminAal1Session();

    // Clean up any existing unverified TOTP factors to avoid factor pollution
    const { data: factorsData } = await authClient.auth.mfa.listFactors();
    if (factorsData?.all) {
      for (const factor of factorsData.all) {
        if (factor.status === 'unverified') {
          await authClient.auth.mfa.unenroll({ factorId: factor.id }).catch(() => {});
        }
      }
    }

    const { data, error } = await authClient.auth.mfa.enroll({
      factorType: 'totp',
      issuer: '모여잇',
      friendlyName: user.email,
    });

    if (error || !data || !data.totp) {
      return adminJsonResponse(
        { success: false, error: '2단계 인증 등록을 시작할 수 없습니다. 잠시 후 다시 시도해 주세요.' },
        { status: 400 }
      );
    }

    return adminJsonResponse({
      success: true,
      factorId: data.id,
      qrCode: data.totp.qr_code,
      secret: data.totp.secret,
      uri: data.totp.uri,
    });
  } catch (error) {
    return errorResponse(error, 'MFA 등록 중 오류가 발생했습니다.', ADMIN_NO_CACHE_HEADERS);
  }
}
