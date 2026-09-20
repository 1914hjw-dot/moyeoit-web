import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/security/adminAuth';
import { getAdminNotices, createNotice } from '@/lib/services/noticeService';
import { requireJsonRequest, errorResponse } from '@/lib/http/api';

export async function GET(): Promise<NextResponse> {
  try {
    await verifyAdminSession();
    const notices = await getAdminNotices();

    return NextResponse.json({
      success: true,
      notices,
    });
  } catch (error) {
    return errorResponse(error, '공지사항 목록을 불러올 수 없습니다.');
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const jsonError = requireJsonRequest(request);
  if (jsonError) return jsonError;

  try {
    await verifyAdminSession();

    const body = await request.json();
    const notice = await createNotice(body);

    return NextResponse.json({
      success: true,
      notice,
    });
  } catch (error) {
    return errorResponse(error, '공지사항 작성에 실패했습니다.');
  }
}
