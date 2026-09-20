import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/security/adminAuth';
import { getAdminFeedbacks } from '@/lib/services/feedbackService';
import { errorResponse, adminJsonResponse, ADMIN_NO_CACHE_HEADERS } from '@/lib/http/api';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    await verifyAdminSession();

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || undefined;
    const category = searchParams.get('category') || undefined;
    const page = searchParams.get('page') ? Number(searchParams.get('page')) : 1;
    const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : 30;

    const result = await getAdminFeedbacks({ status, category, page, limit });

    return adminJsonResponse({
      success: true,
      feedbacks: result.feedbacks,
      totalCount: result.totalCount,
    });
  } catch (error) {
    return errorResponse(error, '문의 목록을 불러올 수 없습니다.', ADMIN_NO_CACHE_HEADERS);
  }
}
