import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/security/adminAuth';
import { updateNotice, deleteNotice } from '@/lib/services/noticeService';
import { requireJsonRequest, errorResponse, adminJsonResponse, ADMIN_NO_CACHE_HEADERS } from '@/lib/http/api';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const jsonError = requireJsonRequest(request);
  if (jsonError) return jsonError;

  try {
    await verifyAdminSession();

    const { id } = await context.params;
    const body = await request.json();
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
