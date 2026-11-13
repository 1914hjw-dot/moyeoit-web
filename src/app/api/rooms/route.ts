import { NextRequest, NextResponse } from 'next/server';
import { createRoom, toPublicRoom } from '@/lib/services/roomService';
import {
  enforceRateLimit,
  errorResponse,
  parseJsonBody,
  requireJsonRequest,
} from '@/lib/http/api';
import { attachHostSecretCookies } from '@/lib/security/hostSecretCookie';

export async function POST(request: NextRequest) {
  const contentTypeError = requireJsonRequest(request);
  if (contentTypeError) return contentTypeError;

  const rateLimitError = await enforceRateLimit(request, 'room-create', 5);
  if (rateLimitError) return rateLimitError;

  try {
    const body = await parseJsonBody<unknown>(request);
    const createdRoom = await createRoom(body);
    const response = NextResponse.json(
      { success: true, room: toPublicRoom({ ...createdRoom, status: createdRoom.status }) },
      { status: 201 }
    );
    attachHostSecretCookies(response, createdRoom);
    return response;
  } catch (error) {
    console.error('API /api/rooms POST failed:', error);
    return errorResponse(error, '모임방 생성 중 오류가 발생했습니다.');
  }
}
