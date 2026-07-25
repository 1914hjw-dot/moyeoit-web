import { NextRequest, NextResponse } from 'next/server';
import { getVotesByRoomId, submitVote, VoteConflictError } from '@/lib/services/voteService';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const votes = await getVotesByRoomId(id);
    return NextResponse.json({ success: true, votes });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: '투표 데이터를 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // 1. Content-Type Header Verification
  const contentType = req.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    return NextResponse.json(
      { success: false, error: '올바른 Content-Type (application/json)이 아닙니다.' },
      { status: 415 }
    );
  }

  try {
    const { id } = await params;
    const body = await req.json();

    // 2. Prototype Pollution Prevention Check
    if (body && (body.__proto__ || body.constructor?.prototype)) {
      return NextResponse.json(
        { success: false, error: '부정확한 요청 바디입니다.' },
        { status: 400 }
      );
    }

    const vote = await submitVote({
      ...body,
      room_id: id,
    });
    return NextResponse.json({ success: true, vote }, { status: 201 });
  } catch (error: any) {
    console.error('API /api/rooms/[id]/votes POST Error:', error);

    // 3. Handle Duplicate Conflict Error gracefully (HTTP 409)
    if (error instanceof VoteConflictError || error.name === 'VoteConflictError') {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || '투표 저장 중 오류가 발생했습니다.' },
      { status: 400 }
    );
  }
}
