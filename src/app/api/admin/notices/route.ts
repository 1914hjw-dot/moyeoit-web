import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/security/adminAuth';
import { getAdminNotices, createNotice } from '@/lib/services/noticeService';
import {
  ADMIN_NO_CACHE_HEADERS,
  adminJsonResponse,
  errorResponse,
  parseJsonBody,
  requireJsonRequest,
} from '@/lib/http/api';

export async function GET(): Promise<NextResponse> {
  try {
    await verifyAdminSession();
    const notices = await getAdminNotices();

    return adminJsonResponse({
      success: true,
      notices,
    });
  } catch (error) {
    return errorResponse(error, '공지사항 목록을 불러올 수 없습니다.', ADMIN_NO_CACHE_HEADERS);
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const jsonError = requireJsonRequest(request, ADMIN_NO_CACHE_HEADERS);
  if (jsonError) return jsonError;

  try {
    await verifyAdminSession();

    const body = await parseJsonBody<Record<string, unknown>>(request);
    const notice = await createNotice(body);

    return adminJsonResponse({
      success: true,
      notice,
    });
  } catch (error) {
    return errorResponse(error, '공지사항 작성에 실패했습니다.', ADMIN_NO_CACHE_HEADERS);
  }
}
