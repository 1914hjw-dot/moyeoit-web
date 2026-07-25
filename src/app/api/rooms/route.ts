import { NextRequest, NextResponse } from 'next/server';
import { createRoom } from '@/lib/services/roomService';

export async function POST(req: NextRequest) {
  // 1. Content-Type Header Verification
  const contentType = req.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    return NextResponse.json(
      { success: false, error: '올바른 Content-Type (application/json)이 아닙니다.' },
      { status: 415 }
    );
  }

  try {
    const body = await req.json();

    // 2. Prototype Pollution Prevention Check
    if (body && (body.__proto__ || body.constructor?.prototype)) {
      return NextResponse.json(
        { success: false, error: '부정확한 요청 바디입니다.' },
        { status: 400 }
      );
    }

    const room = await createRoom(body);
    return NextResponse.json({ success: true, room }, { status: 201 });
  } catch (error: any) {
    console.error('API /api/rooms POST Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || '모임방 생성 중 오류가 발생했습니다.' },
      { status: 400 }
    );
  }
}
