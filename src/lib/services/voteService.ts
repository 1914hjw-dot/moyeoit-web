import 'server-only';

import { OwnedVote, PublicVote, Room, Vote } from '@/types/schema';
import { DeleteVoteInputSchema, SubmitVoteInputSchema } from '@/lib/validation/schemas';
import { supabaseServer } from '@/lib/supabase/server';
import { getVotesByRoomIdMock } from '@/lib/mockStore';
import {
  createPasswordHash,
  timingSafeStringEqual,
  verifyPassword,
} from '@/lib/crypto';
import { getRoomById, isDemoRoomId, logAuditTrail } from './roomService';
import { AppError, ConfigurationError } from '@/lib/errors';
import { checkRateLimit, createRateLimitKey } from '@/lib/security/rateLimiter';

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export class VoteConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'VOTE_CONFLICT');
    this.name = 'VoteConflictError';
  }
}

export function toPublicVote(vote: Vote): PublicVote {
  return {
    id: vote.id,
    room_id: vote.room_id,
    nickname: vote.nickname,
    availability: vote.availability,
    note: vote.note,
    created_at: vote.created_at,
    updated_at: vote.updated_at,
  };
}

function toOwnedVote(vote: Vote): OwnedVote {
  return {
    ...toPublicVote(vote),
    vote_token: vote.vote_token,
  };
}

function mapVoteRecord(data: Record<string, unknown>): Vote {
  return {
    id: String(data.id),
    room_id: String(data.room_id),
    vote_token: typeof data.vote_token === 'string' ? data.vote_token : null,
    nickname: String(data.nickname || ''),
    password_hash: typeof data.password_hash === 'string' ? data.password_hash : '',
    availability:
      data.availability && typeof data.availability === 'object'
        ? (data.availability as Record<string, 'possible' | 'impossible' | 'maybe'>)
        : {},
    note: typeof data.note === 'string' ? data.note : '',
    created_at: String(data.created_at || ''),
    updated_at: String(data.updated_at || ''),
    deleted_at: typeof data.deleted_at === 'string' ? data.deleted_at : null,
  };
}

function generateVoteToken(): string {
  if (!globalThis.crypto?.randomUUID) {
    throw new AppError('안전한 투표 식별자를 생성할 수 없습니다.', 503, 'CRYPTO_UNAVAILABLE');
  }
  return globalThis.crypto.randomUUID();
}

function escapeLikePattern(value: string): string {
  return value.replace(/[\\%_]/g, '\\$&');
}

function validateAvailability(room: Room, availability: Record<string, string>): void {
  const keys = Object.keys(availability);
  if (keys.length === 0) {
    throw new AppError('최소 한 개 이상의 날짜 응답이 필요합니다.', 400, 'EMPTY_AVAILABILITY');
  }

  if (room.date_selection_mode === 'FREE') {
    if (keys.length > 60 || keys.some((key) => !DATE_REGEX.test(key))) {
      throw new AppError('자유 날짜 투표에는 올바른 날짜를 최대 60개까지 등록할 수 있습니다.', 400, 'INVALID_AVAILABILITY');
    }
    return;
  }

  const allowedKeys = new Set<string>();
  for (const date of room.candidate_dates) {
    if (room.schedule_type === 'date_time' && room.time_slots.length > 0) {
      for (const timeSlot of room.time_slots) allowedKeys.add(`${date}_${timeSlot}`);
    } else {
      allowedKeys.add(date);
    }
  }

  if (keys.length > allowedKeys.size || keys.some((key) => !allowedKeys.has(key))) {
    throw new AppError('이 모임방의 후보 날짜와 시간대만 투표할 수 있습니다.', 400, 'INVALID_AVAILABILITY');
  }
}

async function findExistingVote(roomId: string, nickname: string): Promise<Vote | null> {
  if (!supabaseServer) throw new ConfigurationError();

  const { data, error } = await supabaseServer
    .from('votes')
    .select('*')
    .eq('room_id', roomId)
    .ilike('nickname', escapeLikePattern(nickname))
    .is('deleted_at', null)
    .limit(2);
  if (error) {
    console.error('Supabase DB vote lookup failed:', error.message);
    throw new AppError('투표 정보를 확인하지 못했습니다.', 503, 'DATABASE_ERROR');
  }
  if ((data || []).length > 1) {
    throw new VoteConflictError('같은 닉네임의 투표가 여러 개 존재합니다. 다른 닉네임을 사용해 주세요.');
  }
  return data?.[0] ? mapVoteRecord(data[0]) : null;
}

async function authorizeVoteMutation(
  roomId: string,
  nickname: string,
  existing: Vote,
  voteToken: string,
  password: string
): Promise<{ tokenMatch: boolean; passwordMatch: boolean }> {
  const limit = await checkRateLimit(
    createRateLimitKey('vote-auth', `${roomId}:${nickname.toLocaleLowerCase('ko-KR')}`),
    12,
    60_000
  );
  if (!limit.allowed) {
    throw new AppError('소유권 확인 요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.', 429, 'RATE_LIMITED');
  }

  const tokenMatch = Boolean(
    voteToken && existing.vote_token && timingSafeStringEqual(voteToken, existing.vote_token)
  );
  const passwordMatch = Boolean(
    password && existing.password_hash && (await verifyPassword(password, existing.password_hash))
  );

  if (!tokenMatch && !passwordMatch) {
    throw new AppError(
      existing.password_hash
        ? '투표 소유권 토큰 또는 PIN이 올바르지 않습니다.'
        : '이전 투표의 소유권을 확인할 수 없습니다. 새 닉네임으로 투표해 주세요.',
      403,
      'VOTE_AUTH_FAILED'
    );
  }

  return { tokenMatch, passwordMatch };
}

export async function getVotesByRoomId(roomId: string): Promise<PublicVote[]> {
  if (!roomId.trim() || roomId.length > 100) return [];

  const targetRoom = await getRoomById(roomId);
  if (!targetRoom) throw new AppError('존재하지 않는 약속 방입니다.', 404, 'ROOM_NOT_FOUND');
  if (isDemoRoomId(targetRoom.id)) {
    return getVotesByRoomIdMock(targetRoom.id).map(toPublicVote);
  }
  if (!supabaseServer) throw new ConfigurationError();

  const { data, error } = await supabaseServer
    .from('votes')
    .select('id, room_id, nickname, availability, note, created_at, updated_at')
    .eq('room_id', targetRoom.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: true });
  if (error) {
    console.error('Supabase DB vote list failed:', error.message);
    throw new AppError('투표 목록을 불러오지 못했습니다.', 503, 'DATABASE_ERROR');
  }

  return (data || []).map((vote) => toPublicVote(mapVoteRecord(vote)));
}

export async function submitVote(input: unknown): Promise<OwnedVote> {
  const validated = SubmitVoteInputSchema.parse(input);
  const targetRoom = await getRoomById(validated.room_id);
  if (!targetRoom) throw new AppError('존재하지 않는 약속 방입니다.', 404, 'ROOM_NOT_FOUND');
  if (isDemoRoomId(targetRoom.id) && process.env.NODE_ENV === 'production') {
    throw new AppError('시연 모임방은 읽기 전용입니다.', 403, 'DEMO_READ_ONLY');
  }
  if (targetRoom.status !== 'OPEN') {
    throw new AppError('이미 확정된 모임방에는 투표할 수 없습니다.', 409, 'ROOM_ALREADY_CONFIRMED');
  }
  validateAvailability(targetRoom, validated.availability);
  if (!supabaseServer) throw new ConfigurationError();

  const existing = await findExistingVote(targetRoom.id, validated.nickname);
  if (existing) {
    const authorization = await authorizeVoteMutation(
      targetRoom.id,
      validated.nickname,
      existing,
      validated.vote_token,
      validated.password
    );
    const voteToken = existing.vote_token || generateVoteToken();
    const passwordHash = validated.password
      ? await createPasswordHash(validated.password)
      : existing.password_hash;

    const { data, error } = await supabaseServer
      .from('votes')
      .update({
        vote_token: voteToken,
        password_hash: passwordHash,
        availability: validated.availability,
        note: validated.note,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
      .select('*')
      .single();
    if (error || !data) {
      console.error('Supabase DB vote update failed:', error?.message);
      throw new AppError('투표를 수정하지 못했습니다.', 503, 'DATABASE_ERROR');
    }

    await logAuditTrail('VOTE_UPDATED', data.id, {
      room_id: data.room_id,
      nickname: data.nickname,
      authorization: authorization.tokenMatch ? 'token' : 'pin',
    });
    return toOwnedVote(mapVoteRecord(data));
  }

  const voteToken = generateVoteToken();
  const passwordHash = validated.password ? await createPasswordHash(validated.password) : '';
  const { data, error } = await supabaseServer
    .from('votes')
    .insert({
      room_id: targetRoom.id,
      vote_token: voteToken,
      nickname: validated.nickname,
      password_hash: passwordHash,
      availability: validated.availability,
      note: validated.note,
    })
    .select('*')
    .single();
  if (error || !data) {
    console.error('Supabase DB vote insert failed:', error?.code, error?.message);
    if (error?.code === '23505') {
      throw new VoteConflictError('이미 등록된 닉네임입니다. 본인의 투표라면 PIN을 입력해 주세요.');
    }
    throw new AppError('투표를 저장하지 못했습니다.', 503, 'DATABASE_ERROR');
  }

  await logAuditTrail('VOTE_CREATED', data.id, { room_id: data.room_id, nickname: data.nickname });
  return toOwnedVote(mapVoteRecord(data));
}

export async function deleteVote(input: unknown): Promise<{ success: boolean }> {
  const validated = DeleteVoteInputSchema.parse(input);
  const targetRoom = await getRoomById(validated.room_id);
  if (!targetRoom) throw new AppError('존재하지 않는 약속 방입니다.', 404, 'ROOM_NOT_FOUND');
  if (isDemoRoomId(targetRoom.id) && process.env.NODE_ENV === 'production') {
    throw new AppError('시연 모임방은 읽기 전용입니다.', 403, 'DEMO_READ_ONLY');
  }
  if (!supabaseServer) throw new ConfigurationError();

  const existing = await findExistingVote(targetRoom.id, validated.nickname);
  if (!existing) throw new AppError('투표를 찾을 수 없습니다.', 404, 'VOTE_NOT_FOUND');
  await authorizeVoteMutation(
    targetRoom.id,
    validated.nickname,
    existing,
    validated.vote_token,
    validated.password
  );

  const { error } = await supabaseServer
    .from('votes')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', existing.id)
    .is('deleted_at', null);
  if (error) {
    console.error('Supabase DB vote delete failed:', error.message);
    throw new AppError('투표를 삭제하지 못했습니다.', 503, 'DATABASE_ERROR');
  }

  await logAuditTrail('VOTE_DELETED', existing.id, {
    room_id: existing.room_id,
    nickname: existing.nickname,
  });
  return { success: true };
}
