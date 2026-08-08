import { NextRequest, NextResponse } from 'next/server';
import { confirmRoomDate } from '@/lib/services/roomService';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    const confirmedRoom = await confirmRoomDate({
      room_id: id,
      confirmed_date: body.confirmed_date,
      host_secret: body.host_secret,
    });

    return NextResponse.json({
      success: true,
      room: confirmedRoom,
    });
  } catch (err: any) {
    console.error('API confirm route error:', err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || '날짜 확정에 실패했습니다.',
      },
      { status: err.message?.includes('권한') ? 403 : 400 }
    );
  }
}
