import { NextRequest, NextResponse } from 'next/server';
import { deleteVote, getVotesByRoomId, submitVote } from '@/lib/services/voteService';
import {
  enforceRateLimit,
  errorResponse,
  requireJsonRequest,
} from '@/lib/http/api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimitError = await enforceRateLimit(request, 'vote-read', 120);
  if (rateLimitError) return rateLimitError;

  try {
    const { id } = await params;
    const votes = await getVotesByRoomId(id);
    return NextResponse.json(
      { success: true, votes },
      { headers: { 'Cache-Control': 'private, no-store' } }
    );
  } catch (error) {
    console.error('API /api/rooms/[id]/votes GET failed:', error);
    return errorResponse(error, '투표 데이터를 불러오는 중 오류가 발생했습니다.');
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const contentTypeError = requireJsonRequest(request);
  if (contentTypeError) return contentTypeError;
  const rateLimitError = await enforceRateLimit(request, 'vote-write', 15);
  if (rateLimitError) return rateLimitError;

  try {
    const { id } = await params;
    const body = (await request.json()) as Record<string, unknown>;
    const vote = await submitVote({ ...body, room_id: id });
    return NextResponse.json({ success: true, vote }, { status: 201 });
  } catch (error) {
    console.error('API /api/rooms/[id]/votes POST failed:', error);
    return errorResponse(error, '투표 저장 중 오류가 발생했습니다.');
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const contentTypeError = requireJsonRequest(request);
  if (contentTypeError) return contentTypeError;
  const rateLimitError = await enforceRateLimit(request, 'vote-delete', 10);
  if (rateLimitError) return rateLimitError;

  try {
    const { id } = await params;
    const body = (await request.json()) as Record<string, unknown>;
    await deleteVote({ ...body, room_id: id });
    return NextResponse.json({ success: true, message: '투표가 성공적으로 삭제되었습니다.' });
  } catch (error) {
    console.error('API /api/rooms/[id]/votes DELETE failed:', error);
    return errorResponse(error, '투표 삭제 중 오류가 발생했습니다.');
  }
}
