import { NextRequest, NextResponse } from 'next/server';
import { getPublishedNotices, getLatestPinnedNotice } from '@/lib/services/noticeService';
import { errorResponse } from '@/lib/http/api';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const isPinned = request.nextUrl.searchParams.get('pinned') === 'true';

    if (isPinned) {
      const notice = await getLatestPinnedNotice();
      return NextResponse.json({
        success: true,
        notice,
      });
    }

    const notices = await getPublishedNotices();
    return NextResponse.json({
      success: true,
      notices,
    });
  } catch (error) {
    return errorResponse(error, '공지사항을 불러올 수 없습니다.');
  }
}
