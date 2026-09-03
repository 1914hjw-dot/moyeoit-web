import { NextRequest, NextResponse } from 'next/server';
import { getRoomById, toPublicRoom } from '@/lib/services/roomService';
import { enforceRateLimit, errorResponse } from '@/lib/http/api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimitError = await enforceRateLimit(request, 'room-read', 120);
  if (rateLimitError) return rateLimitError;

  try {
    const { id } = await params;
    const room = await getRoomById(id);
    if (!room) {
      return NextResponse.json(
        { success: false, error: '이 모임방을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, room: toPublicRoom(room) },
      { headers: { 'Cache-Control': 'private, no-store' } }
    );
  } catch (error) {
    console.error('API /api/rooms/[id] GET failed:', error);
    return errorResponse(error, '모임방 정보를 불러오는 중 오류가 발생했습니다.');
  }
}
