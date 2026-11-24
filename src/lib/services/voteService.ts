import 'server-only';

import { PublicVote, Vote } from '@/types/schema';
import { supabaseServer } from '@/lib/supabase/server';
import { getVotesByRoomIdMock } from '@/lib/mockStore';
import { getRoomById, isDemoRoomId, logAuditTrail } from './roomService';
import { AppError, ConfigurationError } from '@/lib/errors';
import {
  assertVotePinNotLocked,
  clearVotePinFailuresOnSuccess,
  recordVotePinFailure,
} from '@/lib/security/pinLockout';
import { checkRateLimit, createRateLimitKey } from '@/lib/security/rateLimiter';
import {
  deleteVoteWithDeps,
  submitVoteWithDeps,
  toPublicVote,
  VoteConflictError,
  type VoteMutationContext,
  type VoteServiceDeps,
} from './voteServiceCore';

export { toPublicVote, VoteConflictError };
export type { VoteMutationContext };

const VOTE_SELECT_COLUMNS =
  'id, room_id, nickname, password_hash, availability, note, created_at, updated_at, deleted_at';

function mapVoteRecord(data: Record<string, unknown>): Vote {
  return {
    id: String(data.id),
    room_id: String(data.room_id),
    nickname: String(data.nickname || ''),
    password_hash: typeof data.password_hash === 'string' ? data.password_hash : null,
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

function getSupabaseOrThrow() {
  if (!supabaseServer) throw new ConfigurationError();
  return supabaseServer;
}

const voteServiceDeps: VoteServiceDeps = {
  isProduction: process.env.NODE_ENV === 'production',
  getRoomById,
  isDemoRoomId,

  async findActiveVoteById(roomId: string, voteId: string): Promise<Vote | null> {
    const db = getSupabaseOrThrow();
    const { data, error } = await db
      .from('votes')
      .select(VOTE_SELECT_COLUMNS)
      .eq('room_id', roomId)
      .eq('id', voteId)
      .is('deleted_at', null)
      .maybeSingle();
    if (error) {
      console.error('Supabase DB vote lookup by id failed:', error.message);
      throw new AppError('투표 정보를 확인하지 못했습니다.', 503, 'DATABASE_ERROR');
    }
    return data ? mapVoteRecord(data) : null;
  },

  async findActiveVotesByRoom(roomId: string): Promise<Vote[]> {
    const db = getSupabaseOrThrow();
    const { data, error } = await db
      .from('votes')
      .select(VOTE_SELECT_COLUMNS)
      .eq('room_id', roomId)
      .is('deleted_at', null)
      .order('created_at', { ascending: true });
    if (error) {
      console.error('Supabase DB room votes lookup failed:', error.message);
      throw new AppError('투표 정보를 확인하지 못했습니다.', 503, 'DATABASE_ERROR');
    }
    return (data || []).map((row) => mapVoteRecord(row));
  },

  async insertVote(record) {
    const db = getSupabaseOrThrow();
    const { data, error } = await db
      .from('votes')
      .insert({
        room_id: record.room_id,
        nickname: record.nickname,
        password_hash: record.password_hash,
        availability: record.availability,
        note: record.note,
      })
      .select(VOTE_SELECT_COLUMNS)
      .single();

    if (error || !data) {
      console.error('Supabase DB vote insert failed:', error?.code, error?.message);
      if (error?.code === '23505') {
        return { conflict: true };
      }
      throw new AppError('투표를 저장하지 못했습니다.', 503, 'DATABASE_ERROR');
    }

    return { vote: mapVoteRecord(data) };
  },

  async updateVote(params) {
    const db = getSupabaseOrThrow();
    const { data, error } = await db
      .from('votes')
      .update({
        password_hash: params.password_hash,
        availability: params.availability,
        note: params.note,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .eq('room_id', params.room_id)
      .is('deleted_at', null)
      .select(VOTE_SELECT_COLUMNS)
      .maybeSingle();

    if (error) {
      console.error('Supabase DB vote update failed:', error.message);
      throw new AppError('투표를 수정하지 못했습니다.', 503, 'DATABASE_ERROR');
    }

    return data ? mapVoteRecord(data) : null;
  },

  async softDeleteVote(params) {
    const db = getSupabaseOrThrow();
    let query = db
      .from('votes')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', params.id)
      .eq('room_id', params.room_id)
      .is('deleted_at', null);

    if (params.requireEmptyPassword) {
      if (params.expectedPasswordHash === null || params.expectedPasswordHash === undefined) {
        query = query.is('password_hash', null);
      } else {
        query = query.eq('password_hash', params.expectedPasswordHash);
      }
    }

    const { data, error } = await query.select('id').maybeSingle();
    if (error) {
      console.error('Supabase DB vote delete failed:', error.message);
      throw new AppError('투표를 삭제하지 못했습니다.', 503, 'DATABASE_ERROR');
    }

    return Boolean(data);
  },

  assertVotePinNotLocked,
  recordVotePinFailure,
  clearVotePinFailuresOnSuccess,

  async assertLegacyMutationAllowed(roomId: string, clientIp?: string | null): Promise<void> {
    const cleanIp = (clientIp || '').trim() || 'unknown';
    const limit = await checkRateLimit(
      createRateLimitKey('vote-legacy-mutation', `${roomId}:${cleanIp}`),
      5,
      10 * 60_000,
      { failClosed: true }
    );
    if (limit.backendUnavailable) {
      throw new AppError(
        '보안 확인 서비스를 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도해 주세요.',
        503,
        'RATE_LIMIT_UNAVAILABLE'
      );
    }
    if (!limit.allowed) {
      throw new AppError(
        '비밀번호 없는 이전 투표 삭제 요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.',
        429,
        'RATE_LIMITED',
        { retryAfterSeconds: limit.resetTimeSeconds }
      );
    }
  },

  async logAuditTrail(eventType, targetId, payload, metadata) {
    await logAuditTrail(eventType, targetId, payload, metadata);
  },
};

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
    .select('id, room_id, nickname, password_hash, availability, note, created_at, updated_at')
    .eq('room_id', targetRoom.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: true });
  if (error) {
    console.error('Supabase DB vote list failed:', error.message);
    throw new AppError('투표 목록을 불러오지 못했습니다.', 503, 'DATABASE_ERROR');
  }

  return (data || []).map((vote) => toPublicVote(mapVoteRecord(vote)));
}

export async function submitVote(
  input: unknown,
  context?: VoteMutationContext
): Promise<PublicVote> {
  return submitVoteWithDeps(voteServiceDeps, input, context);
}

export async function deleteVote(
  input: unknown,
  context?: VoteMutationContext
): Promise<{ success: boolean }> {
  return deleteVoteWithDeps(voteServiceDeps, input, context);
}
