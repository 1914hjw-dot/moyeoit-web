import { NextResponse } from 'next/server';
import { verifyAdminAal1Session, getAdminMfaRoutingStep } from '@/lib/security/adminAuth';
import { errorResponse, adminJsonResponse, ADMIN_NO_CACHE_HEADERS } from '@/lib/http/api';

export async function GET(): Promise<NextResponse> {
  try {
    const { authClient } = await verifyAdminAal1Session();
    const mfaStatus = await getAdminMfaRoutingStep(authClient);

    return adminJsonResponse({
      success: true,
      step: mfaStatus.step,
      currentLevel: mfaStatus.currentLevel,
      nextLevel: mfaStatus.nextLevel,
      factors: mfaStatus.factors,
      defaultFactorId: mfaStatus.defaultFactorId,
    });
  } catch (error) {
    return errorResponse(error, 'MFA 상태를 확인할 수 없습니다.', ADMIN_NO_CACHE_HEADERS);
  }
}
