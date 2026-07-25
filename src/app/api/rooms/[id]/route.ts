import { NextRequest, NextResponse } from 'next/server';
import { getRoomById } from '@/lib/services/roomService';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const room = await getRoomById(id);
    if (!room) {
      return NextResponse.json(
        { success: false, error: '이 모임방을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, room });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: '모임방 정보를 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
