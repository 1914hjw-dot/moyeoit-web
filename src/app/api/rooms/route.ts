import { NextRequest, NextResponse } from 'next/server';
import { createRoom } from '@/lib/services/roomService';
import { enforceRateLimit, errorResponse, requireJsonRequest } from '@/lib/http/api';

export async function POST(request: NextRequest) {
  const contentTypeError = requireJsonRequest(request);
  if (contentTypeError) return contentTypeError;

  const rateLimitError = await enforceRateLimit(request, 'room-create', 5);
  if (rateLimitError) return rateLimitError;

  try {
    const body: unknown = await request.json();
    const room = await createRoom(body);
    return NextResponse.json({ success: true, room }, { status: 201 });
  } catch (error) {
    console.error('API /api/rooms POST failed:', error);
    return errorResponse(error, '모임방 생성 중 오류가 발생했습니다.');
  }
}
