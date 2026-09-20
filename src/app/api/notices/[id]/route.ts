import { NextRequest, NextResponse } from 'next/server';
import { getPublishedNoticeById } from '@/lib/services/noticeService';
import { errorResponse } from '@/lib/http/api';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await context.params;
    const notice = await getPublishedNoticeById(id);

    if (!notice) {
      return NextResponse.json(
        { success: false, error: '공지사항을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      notice,
    });
  } catch (error) {
    return errorResponse(error, '공지사항을 불러올 수 없습니다.');
  }
}
