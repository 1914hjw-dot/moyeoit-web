import { NextRequest, NextResponse } from 'next/server';
import { enforceRateLimit, errorResponse, requireJsonRequest } from '@/lib/http/api';
import { submitFeedback } from '@/lib/services/feedbackService';

export async function POST(request: NextRequest): Promise<NextResponse> {
  const jsonError = requireJsonRequest(request);
  if (jsonError) return jsonError;

  const rateLimitError = await enforceRateLimit(request, 'feedback', 5, 60_000);
  if (rateLimitError) return rateLimitError;

  try {
    const body = await request.json();
    const userAgent = request.headers.get('user-agent') || undefined;
    const feedback = await submitFeedback(body, userAgent);

    return NextResponse.json({
      success: true,
      message: '문의가 전달되었습니다.',
      id: feedback.id,
    });
  } catch (error) {
    return errorResponse(error, '문의 전송에 실패했습니다. 잠시 후 다시 시도해 주세요.');
  }
}
