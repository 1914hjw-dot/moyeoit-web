import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/security/adminAuth';
import { updateFeedbackStatus } from '@/lib/services/feedbackService';
import {
  ADMIN_NO_CACHE_HEADERS,
  adminJsonResponse,
  errorResponse,
  parseJsonBody,
  requireJsonRequest,
} from '@/lib/http/api';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const jsonError = requireJsonRequest(request, ADMIN_NO_CACHE_HEADERS);
  if (jsonError) return jsonError;

  try {
    await verifyAdminSession();

    const { id } = await context.params;
    const body = await parseJsonBody<Record<string, unknown>>(request);
    const updated = await updateFeedbackStatus(id, body?.status);

    return adminJsonResponse({
      success: true,
      feedback: updated,
    });
  } catch (error) {
    return errorResponse(error, '문의 상태 변경에 실패했습니다.', ADMIN_NO_CACHE_HEADERS);
  }
}
