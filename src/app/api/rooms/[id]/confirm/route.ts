import { NextRequest, NextResponse } from 'next/server';
import { confirmRoomDate, toPublicRoom } from '@/lib/services/roomService';
import { enforceRateLimit, errorResponse, requireJsonRequest } from '@/lib/http/api';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const contentTypeError = requireJsonRequest(request);
  if (contentTypeError) return contentTypeError;
  const rateLimitError = await enforceRateLimit(request, 'room-confirm', 5);
  if (rateLimitError) return rateLimitError;

  try {
    const { id } = await params;
    const body = (await request.json()) as Record<string, unknown>;
    const room = await confirmRoomDate({ ...body, room_id: id });
    return NextResponse.json({ success: true, room: toPublicRoom(room) });
  } catch (error) {
    console.error('API /api/rooms/[id]/confirm POST failed:', error);
    return errorResponse(error, '날짜 확정에 실패했습니다.');
  }
}
