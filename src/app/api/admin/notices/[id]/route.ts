import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/security/adminAuth';
import { updateNotice, deleteNotice } from '@/lib/services/noticeService';
import {
  ADMIN_NO_CACHE_HEADERS,
  adminJsonResponse,
  errorResponse,
  parseJsonBody,
  requireJsonRequest,
  verifySameOrigin,
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
    const updated = await updateNotice(id, body);

    return adminJsonResponse({
      success: true,
      notice: updated,
    });
  } catch (error) {
    return errorResponse(error, '공지사항 수정에 실패했습니다.', ADMIN_NO_CACHE_HEADERS);
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const originError = verifySameOrigin(request, ADMIN_NO_CACHE_HEADERS);
  if (originError) return originError;

  try {
    await verifyAdminSession();

    const { id } = await context.params;
    await deleteNotice(id);

    return adminJsonResponse({
      success: true,
      message: '공지사항이 삭제되었습니다.',
    });
  } catch (error) {
    return errorResponse(error, '공지사항 삭제에 실패했습니다.', ADMIN_NO_CACHE_HEADERS);
  }
}
