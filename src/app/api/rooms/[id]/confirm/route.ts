import { NextRequest, NextResponse } from 'next/server';
import { confirmRoomDate, getRoomById, toPublicRoom } from '@/lib/services/roomService';
import {
  enforceRateLimit,
  errorResponse,
  parseJsonBody,
  requireJsonRequest,
} from '@/lib/http/api';
import { extractHostSecretFromCookies } from '@/lib/security/hostSecretCookie';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const contentTypeError = requireJsonRequest(request);
  if (contentTypeError) return contentTypeError;
  const rateLimitError = await enforceRateLimit(request, 'room-confirm', 5, 60_000, {
    failClosed: true,
  });
  if (rateLimitError) return rateLimitError;

  try {
    const { id } = await params;
    const body = await parseJsonBody<Record<string, unknown>>(request);
    const bodySecret = typeof body?.host_secret === 'string' ? body.host_secret.trim() : '';

    let effectiveSecret = bodySecret || extractHostSecretFromCookies(request, [id]);
    if (!effectiveSecret) {
      const targetRoom = await getRoomById(id);
      if (targetRoom) {
        effectiveSecret = extractHostSecretFromCookies(request, [
          id,
          targetRoom.id,
          targetRoom.legacy_slug,
        ]);
      }
    }

    const room = await confirmRoomDate({
      ...body,
      room_id: id,
      host_secret: effectiveSecret,
    });
    return NextResponse.json({ success: true, room: toPublicRoom(room) });
  } catch (error) {
    console.error('API /api/rooms/[id]/confirm POST failed:', error);
    return errorResponse(error, '날짜 확정에 실패했습니다.');
  }
}
